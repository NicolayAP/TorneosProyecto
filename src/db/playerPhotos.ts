/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dexie from 'dexie';

const photoDb = new Dexie('TorneoAppPhotos');

photoDb.version(1).stores({
  playerPhotos: 'playerId'
});

interface PhotoRecord {
  playerId: string;
  blob: Blob;
}

export async function savePlayerPhoto(playerId: string, blob: Blob): Promise<void> {
  await photoDb.table<PhotoRecord>('playerPhotos').put({ playerId, blob });
}

export async function getPlayerPhoto(playerId: string): Promise<Blob | null> {
  const record = await photoDb.table<PhotoRecord>('playerPhotos').get(playerId);
  return record?.blob ?? null;
}

export async function deletePlayerPhoto(playerId: string): Promise<void> {
  await photoDb.table('playerPhotos').delete(playerId);
}

export function convertToWebP(blob: Blob, quality = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas 2D not available')); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (webp) => webp ? resolve(webp) : reject(new Error('WebP conversion failed')),
        'image/webp',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image for WebP conversion'));
    img.src = URL.createObjectURL(blob);
  });
}
