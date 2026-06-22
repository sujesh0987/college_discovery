import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getComparison = async (req: Request, res: Response) => {
  try {
    const idsString = req.query.ids ? String(req.query.ids) : '';
    if (!idsString) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'No college IDs provided' }
      });
    }

    const ids = idsString.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'No valid college IDs provided' }
      });
    }

    if (ids.length > 3) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Can compare a maximum of 3 colleges' }
      });
    }

    const colleges = await prisma.college.findMany({
      where: {
        id: { in: ids }
      },
      include: {
        courses: true,
        placements: true,
        facilities: true,
        reviews: {
          select: {
            rating: true,
            academicsRating: true,
            facultyRating: true,
            placementsRating: true,
            infrastructureRating: true,
            socialLifeRating: true
          }
        }
      }
    });

    const comparisonData = colleges.map(col => {
      // Aggregate reviews
      let academicsAvg = 0;
      let facultyAvg = 0;
      let placementsAvg = 0;
      let infraAvg = 0;
      let socialAvg = 0;
      const reviewCount = col.reviews.length;

      if (reviewCount > 0) {
        col.reviews.forEach(r => {
          academicsAvg += r.academicsRating;
          facultyAvg += r.facultyRating;
          placementsAvg += r.placementsRating;
          infraAvg += r.infrastructureRating;
          socialAvg += r.socialLifeRating;
        });
        academicsAvg = parseFloat((academicsAvg / reviewCount).toFixed(1));
        facultyAvg = parseFloat((facultyAvg / reviewCount).toFixed(1));
        placementsAvg = parseFloat((placementsAvg / reviewCount).toFixed(1));
        infraAvg = parseFloat((infraAvg / reviewCount).toFixed(1));
        socialAvg = parseFloat((socialAvg / reviewCount).toFixed(1));
      }

      return {
        ...col,
        reviewCount,
        ratingsBreakdown: {
          overall: col.rating,
          academics: academicsAvg || col.rating,
          faculty: facultyAvg || col.rating,
          placements: placementsAvg || col.rating,
          infrastructure: infraAvg || col.rating,
          socialLife: socialAvg || col.rating
        },
        reviews: undefined // Clean response
      };
    });

    return res.json({
      success: true,
      data: comparisonData
    });
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};

const saveComparisonSchema = z.object({
  name: z.string().min(2).max(100),
  collegeIds: z.array(z.number())
});

export const saveComparison = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Auth required' }
      });
    }

    const body = saveComparisonSchema.parse(req.body);
    const idsString = body.collegeIds.join(',');

    const savedComparison = await prisma.savedComparison.create({
      data: {
        userId,
        name: body.name,
        collegeIds: idsString
      }
    });

    return res.status(201).json({
      success: true,
      data: savedComparison
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Input validation failed', details: error.errors }
      });
    }
    console.error('Error saving comparison:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};

export const getSavedComparisons = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Auth required' }
      });
    }

    const comparisons = await prisma.savedComparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // For each comparison, fetch high level metadata of the colleges
    const richComparisons = await Promise.all(comparisons.map(async (comp) => {
      const ids = comp.collegeIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      const colleges = await prisma.college.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, logoUrl: true, locationCity: true }
      });

      return {
        id: comp.id,
        name: comp.name,
        collegeIds: ids,
        colleges,
        createdAt: comp.createdAt
      };
    }));

    return res.json({
      success: true,
      data: richComparisons
    });
  } catch (error) {
    console.error('Error getting saved comparisons:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};

export const deleteSavedComparison = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.userId;

    if (isNaN(id) || !userId) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid comparison ID' }
      });
    }

    const comp = await prisma.savedComparison.findFirst({
      where: { id, userId }
    });

    if (!comp) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Saved comparison not found or access denied' }
      });
    }

    await prisma.savedComparison.delete({
      where: { id }
    });

    return res.json({
      success: true,
      data: { message: 'Saved comparison deleted successfully' }
    });
  } catch (error) {
    console.error('Error deleting saved comparison:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};
