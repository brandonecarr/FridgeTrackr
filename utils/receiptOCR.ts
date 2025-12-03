import { ScannedReceiptItem } from '@/types';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Receipt OCR Utility
 *
 * NOTE: This is a SIMULATED OCR implementation for demonstration purposes.
 * In a production app, you would integrate with a real OCR service like:
 * - Google Cloud Vision API
 * - AWS Textract
 * - Azure Computer Vision
 * - Tesseract.js (on-device OCR)
 */

interface OCRResult {
  storeName?: string;
  totalAmount?: number;
  items: ScannedReceiptItem[];
  rawText: string;
}

/**
 * Process receipt image and extract items
 * This simulated version returns sample data
 * In production, this would send the image to an OCR API
 */
export async function processReceiptImage(imageUri: string): Promise<OCRResult> {
  try {
    // Step 1: Optimize image for OCR (resize and compress)
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        { resize: { width: 1200 } }, // Resize to optimal width for OCR
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Step 2: In production, send manipulatedImage.uri to OCR API
    // const response = await fetch('YOUR_OCR_API_ENDPOINT', {
    //   method: 'POST',
    //   body: {
    //     image: manipulatedImage.uri,
    //   },
    // });
    // const ocrData = await response.json();

    // Step 3: For demo purposes, simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Return simulated OCR results
    // In production, you would parse the actual OCR response
    return simulateOCRResult();
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process receipt image');
  }
}

/**
 * Simulate OCR result for demonstration
 * In production, this would be replaced by real OCR parsing
 */
function simulateOCRResult(): OCRResult {
  // Sample receipt data
  const sampleItems = [
    {
      text: 'ORGANIC BANANAS',
      suggestedName: 'Bananas',
      quantity: 1,
      unit: 'lb',
      price: 2.49,
      matched: false,
      isConfirmed: false,
      suggestedStorageAreaId: undefined,
      suggestedExpirationDays: 7,
    },
    {
      text: 'WHOLE MILK GALLON',
      suggestedName: 'Whole Milk',
      quantity: 1,
      unit: 'gallon',
      price: 4.99,
      matched: false,
      isConfirmed: false,
      suggestedStorageAreaId: undefined,
      suggestedExpirationDays: 10,
    },
    {
      text: 'CHICKEN BREAST',
      suggestedName: 'Chicken Breast',
      quantity: 2,
      unit: 'lb',
      price: 12.98,
      matched: false,
      isConfirmed: false,
      suggestedStorageAreaId: undefined,
      suggestedExpirationDays: 3,
    },
    {
      text: 'ROMA TOMATOES',
      suggestedName: 'Tomatoes',
      quantity: 1.5,
      unit: 'lb',
      price: 3.47,
      matched: false,
      isConfirmed: false,
      suggestedStorageAreaId: undefined,
      suggestedExpirationDays: 5,
    },
    {
      text: 'BREAD WHEAT',
      suggestedName: 'Wheat Bread',
      quantity: 1,
      unit: 'loaf',
      price: 3.99,
      matched: false,
      isConfirmed: false,
      suggestedStorageAreaId: undefined,
      suggestedExpirationDays: 7,
    },
    {
      text: 'EGGS LARGE',
      suggestedName: 'Eggs',
      quantity: 1,
      unit: 'dozen',
      price: 4.29,
      matched: false,
      isConfirmed: false,
      suggestedStorageAreaId: undefined,
      suggestedExpirationDays: 21,
    },
    {
      text: 'CHEDDAR CHEESE',
      suggestedName: 'Cheddar Cheese',
      quantity: 1,
      unit: 'lb',
      price: 5.99,
      matched: false,
      isConfirmed: false,
      suggestedStorageAreaId: undefined,
      suggestedExpirationDays: 14,
    },
  ];

  return {
    storeName: 'Whole Foods Market',
    totalAmount: 38.20,
    items: sampleItems,
    rawText: `
      WHOLE FOODS MARKET
      123 Main Street
      Date: ${new Date().toLocaleDateString()}

      ORGANIC BANANAS       $2.49
      WHOLE MILK GALLON     $4.99
      CHICKEN BREAST        $12.98
      ROMA TOMATOES         $3.47
      BREAD WHEAT           $3.99
      EGGS LARGE            $4.29
      CHEDDAR CHEESE        $5.99

      SUBTOTAL             $38.20
      TAX                   $0.00
      TOTAL                $38.20
    `.trim(),
  };
}

/**
 * Suggest storage area based on item name
 */
export function suggestStorageArea(itemName: string, storageAreaIds: { fridge?: string; freezer?: string; pantry?: string }): string | undefined {
  const lowerName = itemName.toLowerCase();

  // Fridge items
  const fridgeKeywords = ['milk', 'cheese', 'yogurt', 'butter', 'eggs', 'chicken', 'beef', 'pork', 'fish', 'vegetables', 'tomato', 'lettuce', 'carrot'];
  if (fridgeKeywords.some(keyword => lowerName.includes(keyword))) {
    return storageAreaIds.fridge;
  }

  // Freezer items
  const freezerKeywords = ['frozen', 'ice cream', 'popsicle'];
  if (freezerKeywords.some(keyword => lowerName.includes(keyword))) {
    return storageAreaIds.freezer;
  }

  // Pantry items (default)
  return storageAreaIds.pantry;
}

/**
 * Suggest expiration days based on item type
 */
export function suggestExpirationDays(itemName: string): number {
  const lowerName = itemName.toLowerCase();

  // Fresh meat/fish: 2-3 days
  if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork') || lowerName.includes('fish')) {
    return 3;
  }

  // Dairy: 7-14 days
  if (lowerName.includes('milk') || lowerName.includes('yogurt')) {
    return 10;
  }
  if (lowerName.includes('cheese') || lowerName.includes('butter')) {
    return 14;
  }

  // Eggs: 21 days
  if (lowerName.includes('egg')) {
    return 21;
  }

  // Fresh produce: 5-7 days
  if (lowerName.includes('tomato') || lowerName.includes('lettuce') || lowerName.includes('pepper') || lowerName.includes('cucumber')) {
    return 5;
  }
  if (lowerName.includes('banana') || lowerName.includes('apple') || lowerName.includes('orange')) {
    return 7;
  }

  // Bread: 5-7 days
  if (lowerName.includes('bread') || lowerName.includes('bagel') || lowerName.includes('tortilla')) {
    return 7;
  }

  // Canned/packaged: 365 days
  if (lowerName.includes('can') || lowerName.includes('canned') || lowerName.includes('jar')) {
    return 365;
  }

  // Default: 14 days
  return 14;
}

/**
 * Parse quantity from OCR text
 * Examples: "2.5 LB", "1 GALLON", "3 PACK"
 */
export function parseQuantityFromText(text: string): { quantity: number; unit: string } {
  const lowerText = text.toLowerCase();

  // Try to find quantity patterns
  const quantityMatch = lowerText.match(/(\d+\.?\d*)\s*(lb|oz|kg|g|gallon|quart|pint|pack|item|dozen|loaf)/);

  if (quantityMatch) {
    return {
      quantity: parseFloat(quantityMatch[1]),
      unit: quantityMatch[2],
    };
  }

  // Default
  return { quantity: 1, unit: 'item' };
}

/**
 * Estimate category from item name
 */
export function suggestCategory(itemName: string): string {
  const lowerName = itemName.toLowerCase();

  if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork') || lowerName.includes('fish')) {
    return 'Meat & Seafood';
  }
  if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt') || lowerName.includes('butter')) {
    return 'Dairy';
  }
  if (lowerName.includes('egg')) {
    return 'Dairy';
  }
  if (lowerName.includes('tomato') || lowerName.includes('lettuce') || lowerName.includes('banana') || lowerName.includes('apple') || lowerName.includes('carrot')) {
    return 'Produce';
  }
  if (lowerName.includes('bread') || lowerName.includes('bagel') || lowerName.includes('tortilla')) {
    return 'Bakery';
  }

  return 'Grocery';
}
