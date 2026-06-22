import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth';

// Helper to map UI streams to database course keywords
const getStreamKeywords = (stream: string): string[] => {
  switch (stream.toLowerCase()) {
    case 'engineering':
      return ['b.tech', 'b.e.', 'm.tech', 'engineering', 'vlsi'];
    case 'medical':
      return ['mbbs', 'nursing', 'md', 'medicine'];
    case 'mba':
      return ['mba', 'pgp', 'management', 'business'];
    case 'law':
      return ['ll.b', 'll.m', 'law'];
    case 'arts':
      return ['ba ', 'b.a.', 'arts', 'english', 'economics'];
    case 'science':
      return ['b.sc', 'm.sc', 'science', 'physics', 'chemistry'];
    default:
      return [];
  }
};

export const getColleges = async (req: Request, res: Response) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : '';
    const state = req.query.state ? String(req.query.state) : '';
    const city = req.query.city ? String(req.query.city) : '';
    const stream = req.query.stream ? String(req.query.stream) : '';
    const feesMin = req.query.fees_min ? parseFloat(String(req.query.fees_min)) : 0;
    const feesMax = req.query.fees_max ? parseFloat(String(req.query.fees_max)) : Infinity;
    const rating = req.query.rating ? parseFloat(String(req.query.rating)) : 0;
    const ownership = req.query.ownership ? String(req.query.ownership) : '';
    const type = req.query.type ? String(req.query.type) : '';
    const accreditation = req.query.accreditation ? String(req.query.accreditation) : '';
    
    const page = req.query.page ? parseInt(String(req.query.page)) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit)) : 12;
    const sort = req.query.sort ? String(req.query.sort) : 'rating'; // rating, fees, nirf, name

    // Build filters
    const where: any = {};

    // Search query matching college name, city, state or about
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { locationCity: { contains: q } },
        { locationState: { contains: q } },
      ];
    }

    if (state) where.locationState = state;
    if (city) where.locationCity = city;
    if (ownership) where.ownership = ownership;
    if (type) where.type = type;
    if (accreditation) where.naacGrade = accreditation;
    if (rating > 0) where.rating = { gte: rating };

    // Fees filter: only apply when values are finite/set
    const andClauses: any[] = [];
    if (isFinite(feesMax)) andClauses.push({ feesMin: { lte: feesMax } });
    if (feesMin > 0) andClauses.push({ feesMax: { gte: feesMin } });
    if (andClauses.length > 0) where.AND = andClauses;

    // Stream filter based on course keywords
    if (stream) {
      const keywords = getStreamKeywords(stream);
      if (keywords.length > 0) {
        where.courses = {
          some: {
            OR: keywords.map(kw => ({
              name: { contains: kw }
            }))
          }
        };
      }
    }

    // Sorting
    let orderBy: any = {};
    if (sort === 'fees') {
      orderBy = { feesMin: 'asc' };
    } else if (sort === 'nirf') {
      // NIRF can be null. Put nulls at the end
      orderBy = { nirfRank: 'asc' };
    } else if (sort === 'name') {
      orderBy = { name: 'asc' };
    } else {
      // Default to rating high -> low
      orderBy = { rating: 'desc' };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await prisma.college.count({ where });
    const colleges = await prisma.college.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        courses: {
          take: 3 // Include first 3 courses as preview tags
        },
        reviews: {
          select: { id: true }
        }
      }
    });

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: colleges.map(col => ({
        ...col,
        reviewCount: col.reviews.length,
        reviews: undefined // remove full reviews list from preview
      })),
      meta: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};

export const getCollegeSuggestions = async (req: Request, res: Response) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : '';
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const suggestions = await prisma.college.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { locationCity: { contains: q } }
        ]
      },
      select: {
        id: true,
        name: true,
        locationCity: true,
        locationState: true,
        logoUrl: true
      },
      take: 5
    });

    return res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};

export const getFilters = async (req: Request, res: Response) => {
  try {
    const colleges = await prisma.college.findMany({
      select: {
        locationState: true,
        locationCity: true,
        ownership: true,
        type: true,
        naacGrade: true
      }
    });

    const states = Array.from(new Set(colleges.map(c => c.locationState).filter(Boolean)));
    const cities = Array.from(new Set(colleges.map(c => c.locationCity).filter(Boolean)));
    const ownerships = Array.from(new Set(colleges.map(c => c.ownership).filter(Boolean)));
    const types = Array.from(new Set(colleges.map(c => c.type).filter(Boolean)));
    const accreditations = Array.from(new Set(colleges.map(c => c.naacGrade).filter(Boolean)));
    const streams = ['Engineering', 'Medical', 'MBA', 'Law', 'Arts', 'Science'];

    // Map cities to states for cascading dropdowns
    const stateCityMap: Record<string, string[]> = {};
    colleges.forEach(c => {
      if (c.locationState && c.locationCity) {
        if (!stateCityMap[c.locationState]) {
          stateCityMap[c.locationState] = [];
        }
        if (!stateCityMap[c.locationState].includes(c.locationCity)) {
          stateCityMap[c.locationState].push(c.locationCity);
        }
      }
    });

    return res.json({
      success: true,
      data: {
        states,
        cities,
        ownerships,
        types,
        accreditations,
        streams,
        stateCityMap
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};

export const getCollegeDetail = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid college ID' }
      });
    }

    const college = await prisma.college.findUnique({
      where: { id },
      include: {
        courses: true,
        placements: true,
        facilities: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'College not found' }
      });
    }

    // Calculate aggregated ratings breakdown
    let academicsAvg = 0;
    let facultyAvg = 0;
    let placementsAvg = 0;
    let infraAvg = 0;
    let socialAvg = 0;
    const reviewCount = college.reviews.length;

    if (reviewCount > 0) {
      college.reviews.forEach(r => {
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

    return res.json({
      success: true,
      data: {
        ...college,
        reviewCount,
        ratingsBreakdown: {
          overall: college.rating,
          academics: academicsAvg || college.rating,
          faculty: facultyAvg || college.rating,
          placements: placementsAvg || college.rating,
          infrastructure: infraAvg || college.rating,
          socialLife: socialAvg || college.rating,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching college detail:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  academicsRating: z.number().min(1).max(5),
  facultyRating: z.number().min(1).max(5),
  placementsRating: z.number().min(1).max(5),
  infrastructureRating: z.number().min(1).max(5),
  socialLifeRating: z.number().min(1).max(5),
  title: z.string().min(3).max(100),
  body: z.string().min(10).max(1000),
});

export const submitReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const collegeId = parseInt(req.params.id);
    const userId = req.user?.userId;

    if (isNaN(collegeId) || !userId) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid request parameters' }
      });
    }

    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'College not found' }
      });
    }

    const body = reviewSchema.parse(req.body);

    const review = await prisma.review.create({
      data: {
        collegeId,
        userId,
        rating: body.rating,
        academicsRating: body.academicsRating,
        facultyRating: body.facultyRating,
        placementsRating: body.placementsRating,
        infrastructureRating: body.infrastructureRating,
        socialLifeRating: body.socialLifeRating,
        title: body.title,
        body: body.body
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    // Recalculate college aggregate rating
    const allReviews = await prisma.review.findMany({
      where: { collegeId },
      select: { rating: true }
    });
    
    const sumRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAverage = parseFloat((sumRatings / allReviews.length).toFixed(1));

    await prisma.college.update({
      where: { id: collegeId },
      data: { rating: newAverage }
    });

    return res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Input validation failed', details: error.errors }
      });
    }
    console.error('Error submitting review:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};

export const markReviewHelpful = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviewId = parseInt(req.params.rid);
    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid review ID' }
      });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Review not found' }
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } }
    });

    return res.json({
      success: true,
      data: {
        reviewId: updatedReview.id,
        helpfulCount: updatedReview.helpfulCount
      }
    });
  } catch (error) {
    console.error('Error marking review helpful:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};
