import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// GET /api/uploads/...path - Serve uploaded files
export async function GET(request: NextRequest) {
  try {
    // Get the raw path and decode it
    const pathname = request.nextUrl.pathname;
    const relativePath = decodeURIComponent(pathname.replace('/api/uploads/', ''));

    // Try to construct the file path
    const baseDir = path.join(process.cwd(), 'public', 'uploads');
    console.log('Step 1 - baseDir:', baseDir);

    console.log('Step 2 - relativePath:', relativePath);

    const filePath = path.join(baseDir, relativePath);
    console.log('Step 3 - filePath:', filePath);
    console.log('Step 4 - typeof filePath:', typeof filePath);

    console.log('Step 5 - existsSync check');
    const exists = fs.existsSync(filePath);
    console.log('File exists:', exists);

    if (!exists) {
      return NextResponse.json(
        { success: false, error: '文件不存在', path: filePath },
        { status: 404 }
      );
    }

    const fileName = relativePath.split('/').pop() || 'file';
    console.log('Step 6 - fileName:', fileName);

    const ext = fileName.split('.').pop()?.toLowerCase();
    console.log('Step 7 - ext:', ext);

    let contentType = 'application/octet-stream';
    if (ext === 'pdf') contentType = 'application/pdf';
    else if (ext === 'doc') contentType = 'application/msword';
    else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';

    console.log('Step 8 - About to readFile');
    const fileBuffer = await fs.promises.readFile(filePath);
    console.log('Step 9 - File read successfully, size:', fileBuffer.length);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Failed to serve file:', error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { success: false, error: '获取文件失败', details: String(error) },
      { status: 500 }
    );
  }
}
