import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  examType: z.string().optional().nullable(),
  targetYear: z.number().int().optional().nullable(),
  password: z.string().min(6).optional()
});

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Auth required' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        examType: true,
        targetYear: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Auth required' }
      });
    }

    const body = updateProfileSchema.parse(req.body);

    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.examType !== undefined) updateData.examType = body.examType;
    if (body.targetYear !== undefined) updateData.targetYear = body.targetYear;
    if (body.password) {
      updateData.passwordHash = await bcrypt.hash(body.password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        examType: true,
        targetYear: true
      }
    });

    return res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Input validation failed', details: error.errors }
      });
    }
    console.error('Error updating user profile:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};

export const getSavedColleges = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Auth required' }
      });
    }

    const saved = await prisma.savedCollege.findMany({
      where: { userId },
      include: {
        college: {
          include: {
            courses: { take: 3 },
            reviews: { select: { id: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: saved.map(s => ({
        id: s.id,
        collegeId: s.collegeId,
        createdAt: s.createdAt,
        college: {
          ...s.college,
          reviewCount: s.college.reviews.length,
          reviews: undefined
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching saved colleges:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};

const saveCollegeSchema = z.object({
  collegeId: z.number().int()
});

export const saveCollege = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Auth required' }
      });
    }

    const body = saveCollegeSchema.parse(req.body);

    // Check if college exists
    const college = await prisma.college.findUnique({
      where: { id: body.collegeId }
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'College not found' }
      });
    }

    // Check soft limit (50 saved colleges)
    const count = await prisma.savedCollege.count({ where: { userId } });
    if (count >= 50) {
      return res.status(400).json({
        success: false,
        error: { code: 'LIMIT_EXCEEDED', message: 'Maximum limit of 50 saved colleges reached' }
      });
    }

    // Check if already saved
    const existing = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId,
          collegeId: body.collegeId
        }
      }
    });

    if (existing) {
      return res.json({
        success: true,
        data: existing
      });
    }

    const saved = await prisma.savedCollege.create({
      data: {
        userId,
        collegeId: body.collegeId
      }
    });

    return res.status(201).json({
      success: true,
      data: saved
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Input validation failed', details: error.errors }
      });
    }
    console.error('Error saving college:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};

export const deleteSavedCollege = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const collegeId = parseInt(req.params.id);
    const userId = req.user?.userId;

    if (isNaN(collegeId) || !userId) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid college ID' }
      });
    }

    const saved = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId,
          collegeId
        }
      }
    });

    if (!saved) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Saved college record not found' }
      });
    }

    await prisma.savedCollege.delete({
      where: {
        id: saved.id
      }
    });

    return res.json({
      success: true,
      data: { message: 'College unsaved successfully' }
    });
  } catch (error) {
    console.error('Error deleting saved college:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }
};
