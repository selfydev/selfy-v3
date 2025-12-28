import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { AssetType } from '@prisma/client';

// GET /api/assets - Get all assets for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assets = await prisma.userAsset.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

// POST /api/assets - Upload a new asset
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { file, name, type } = body as {
      file: string; // Base64 encoded file
      name: string;
      type: AssetType;
    };

    if (!file || !name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: file, name, type' },
        { status: 400 }
      );
    }

    // Validate asset type
    if (!['LOGO', 'IMAGE', 'FONT'].includes(type)) {
      return NextResponse.json({ error: 'Invalid asset type' }, { status: 400 });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file, {
      folder: 'assets',
      userId: session.user.id,
      resourceType: type === 'FONT' ? 'raw' : 'image',
    });

    // Save to database
    const asset = await prisma.userAsset.create({
      data: {
        userId: session.user.id,
        name,
        type,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Error uploading asset:', error);
    return NextResponse.json({ error: 'Failed to upload asset' }, { status: 500 });
  }
}

// DELETE /api/assets - Delete an asset
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('id');

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID required' }, { status: 400 });
    }

    // Find the asset and verify ownership
    const asset = await prisma.userAsset.findFirst({
      where: {
        id: assetId,
        userId: session.user.id,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(asset.publicId);

    // Delete from database
    await prisma.userAsset.delete({
      where: { id: assetId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}

