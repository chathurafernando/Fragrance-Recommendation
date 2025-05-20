// ────────────── Imports ──────────────
// reportService.js
import PDFDocument from 'pdfkit';
import { Op, fn, col, literal, where } from 'sequelize';
import { sequelize } from '../db.js';
import Brand from '../models/brand.js';
import Note from '../models/notes.js'
import Fragrance from '../models/fragrance.js';
import Wishlist from '../models/wishlist.js';
import { BusinessInfo } from '../models/BusinessInfo.js';
import VendorProduct from '../models/vendorProducts.js';
import User from '../models/user.js';
import Product from '../models/products.js';
// import { Advertisement } from '../models/advertisement.js';
// import { UserPersonalTaste } from '../models/userPersonalTaste.js';
import { UserFavoriteNote } from '../models/userFavoriteNote.js';
import UserPersonalTaste from '../models/userPersonalTastes.js';
import { Advertisement } from '../models/Advertisement.js';
import FragranceClick from '../models/FragranceClick.js';

// Helper functions for PDF generation
const createPdfDoc = (res, filename) => {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  doc.pipe(res);
  return doc;
};

const addHeader = (doc, title) => {
  const today = new Date().toLocaleDateString();
  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Generated: ${today}`, { align: 'center' });
  doc.moveDown(1);
};

const addSection = (doc, title) => {
  doc.moveDown(0.8).fontSize(14).text(title, { underline: true });
  doc.moveDown(0.4);
};

const tableRow = (doc, cols) => {
  cols.forEach(({ w, text }) =>
    doc.text(text, { continued: w !== 'end', width: w === 'end' ? undefined : w })
  );
  doc.moveDown(0.2);
};

// --- Helper: Draw Centered Uniform Table ---
function drawUniformTable(doc, headers, rows) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colCount = headers.length;
  const colWidth = pageWidth / colCount;
  const rowHeight = 20;
  const startX = doc.page.margins.left;
  let y = doc.y;

  // Header
  doc.font('Helvetica-Bold').fontSize(10);
  headers.forEach((header, i) => {
    doc.text(header, startX + i * colWidth, y, {
      width: colWidth,
      align: 'center'
    });
  });

  y += rowHeight;
  doc.moveTo(startX, y - 5).lineTo(startX + pageWidth, y - 5).stroke();

  // Data rows
  doc.font('Helvetica').fontSize(9);
  rows.forEach(row => {
    row.forEach((cell, i) => {
      doc.text(cell, startX + i * colWidth, y, {
        width: colWidth,
        align: 'center'
      });
    });
    y += rowHeight;
  });

  doc.moveDown(1);
}

// --- Helper: Draw Key-Value Table ---
function drawKeyValueTable(doc, dataRows) {
  const startX = doc.page.margins.left;
  const keyWidth = 150;
  const valueWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right - keyWidth;
  const rowHeight = 20;
  let y = doc.y;

  doc.font('Helvetica').fontSize(10);

  dataRows.forEach(row => {
    // Key
    doc.font('Helvetica-Bold')
      .text(row[0], startX, y, { width: keyWidth });

    // Value
    doc.font('Helvetica')
      .text(row[1], startX + keyWidth, y, { width: valueWidth });

    y += rowHeight;
  });

  doc.y = y;
}
// 1. Admin Overview Report (enhanced version of your existing report)
export const adminOverviewReport = async (req, res) => {
  try {
    // Fragrances per Brand
    const perBrand = await Fragrance.findAll({
      attributes: [
        [fn('COUNT', col('Fragrance.id')), 'total'],
        [col('brand.name'), 'brandName'],
      ],
      include: [{ model: Brand, as: 'brand', attributes: [] }],
      group: ['brand.id'],
      order: [[literal('total'), 'DESC']],
      raw: true,
    });

    // Vendors by verification status
    const vendorStatus = await BusinessInfo.findAll({
      attributes: [
        'verification',
        [fn('COUNT', col('BusinessInfo.id')), 'count'],
      ],
      group: ['verification'],
      raw: true,
    });

    // Products per vendor (count & avg price)
    const productsPerVendor = await VendorProduct.findAll({
      attributes: [
        [col('company.companyName'), 'company'],
        [fn('COUNT', col('VendorProduct.id')), 'products'],
        [fn('AVG', col('VendorProduct.price')), 'avgPrice'],
      ],
      include: [{ model: BusinessInfo, as: 'company', attributes: [] }],
      group: ['company.id'],
      raw: true,
    });

    // Top 10 most-wish-listed fragrances
    const topWishlist = await Wishlist.findAll({
      attributes: [
        [col('fragrance.name'), 'fragrance'],
        [fn('COUNT', col('Wishlist.id')), 'wishlists'],
      ],
      include: [{ model: Fragrance, as: 'fragrance', attributes: [] }],
      group: ['fragrance.id'],
      order: [[fn('COUNT', col('Wishlist.id')), 'DESC']],
      limit: 10,
      raw: true,
    });

    // Create PDF document
    const today = new Date().toLocaleDateString();
    const doc = createPdfDoc(res, `admin-overview-${today.replace(/\//g, '-')}.pdf`);

    addHeader(doc, 'Admin Overview Report');
    doc.fontSize(10).text(`Generated on: ${today}`, { align: 'right' });
    doc.moveDown(1.5);

    // 1. Fragrances per Brand
    addSection(doc, 'Fragrances per Brand');
    const brandHeaders = ['Brand Name', 'Total Fragrances'];
    const brandRows = perBrand.map(item => [
      item.brandName,
      String(item.total)
    ]);
    drawUniformTable(doc, brandHeaders, brandRows);

    // 2. Vendor Verification Status
    addSection(doc, 'Vendor Verification Status');
    const vendorHeaders = ['Status', 'Count'];
    const vendorRows = vendorStatus.map(item => [
      item.verification || 'Unknown',
      String(item.count)
    ]);
    drawUniformTable(doc, vendorHeaders, vendorRows);

    // Check if we need a new page
    if (doc.y > doc.page.height - 200) {
      doc.addPage();
    }

    // 3. Vendor Product Summary
    addSection(doc, 'Vendor Product Summary');
    const productHeaders = ['Company', 'Products', 'Average Price'];
    const productRows = productsPerVendor.map(item => [
      item.company,
      String(item.products),
      `€${Number(item.avgPrice).toFixed(2)}`
    ]);
    drawUniformTable(doc, productHeaders, productRows);

    // Check if we need a new page
    if (doc.y > doc.page.height - 200) {
      doc.addPage();
    }

    // 4. Top Wishlist Section
    addSection(doc, 'Top 10 Wish-listed Fragrances');
    const wishlistHeaders = ['#', 'Fragrance', 'Wishlist Count'];
    const wishlistRows = topWishlist.map((item, idx) => [
      `${idx + 1}`,
      item.fragrance,
      String(item.wishlists)
    ]);
    drawUniformTable(doc, wishlistHeaders, wishlistRows);


    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Failed to generate admin report' });
  }
};

// // 2. Vendor Performance Report
export const vendorPerformanceReport = async (req, res) => {
  try {
    const companyId = req.params.id;
    console.log('Looking for vendor with Company ID:', companyId);

    // Validate vendor exists
    const vendor = await BusinessInfo.findByPk(companyId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Get vendor's products
    const products = await VendorProduct.findAll({
      where: { company_id: companyId },
      attributes: [
        'id',
        'price',
        'availability',
        [col('product.fragrance.name'), 'fragrance_name'],
        [col('product.brand.name'), 'brand_name'],
      ],
      include: [{
        model: Product,
        as: 'product',
        include: [
          { model: Fragrance, as: 'fragrance' },
          { model: Brand, as: 'brand' }
        ]
      }],
      raw: true
    });

    // Get product count by availability
    const availabilityStats = await VendorProduct.findAll({
      where: { company_id: companyId },
      attributes: [
        'availability',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['availability'],
      raw: true
    });

    // Get price ranges
    const priceStats = await sequelize.query(`
      SELECT 
        CASE 
          WHEN price < 50 THEN 'Under €50'
          WHEN price >= 50 AND price < 100 THEN '€50-€100'
          WHEN price >= 100 AND price < 200 THEN '€100-€200'
          ELSE 'Over €200'
        END as price_range,
        COUNT(*) as count
      FROM vendor_products 
      WHERE company_id = :companyId
      GROUP BY price_range
    `, {
      replacements: { companyId },
      type: sequelize.QueryTypes.SELECT
    });

    // --- Create PDF ---
    const today = new Date().toLocaleDateString();
    const doc = createPdfDoc(res, `vendor-performance-${vendor.companyName.replace(/\s+/g, '-')}-${today.replace(/\//g, '-')}.pdf`);

    addHeader(doc, `Vendor Performance Report: ${vendor.companyName}`);
    doc.fontSize(10).text(`Generated on: ${today}`, { align: 'right' });
    doc.moveDown(1.5);

    // --- Section 1: Vendor Information ---
    addSection(doc, 'Vendor Information');
    const vendorInfoData = [
      ['Company Name', vendor.companyName],
      ['Verification Status', vendor.verification],
      ['Total Products', products.length.toString()]
    ];
    drawKeyValueTable(doc, vendorInfoData);
    doc.moveDown(1.5);

    // --- Section 2: Product Availability ---
    addSection(doc, 'Product Availability');
    drawUniformTable(doc, ['Status', 'Count'], availabilityStats.map(item => [
      item.availability || 'Unknown',
      String(item.count)
    ]));
    doc.moveDown(1);

    // --- Section 3: Price Distribution ---
    addSection(doc, 'Price Distribution');
    drawUniformTable(doc, ['Price Range', 'Count'], priceStats.map(item => [
      item.price_range,
      String(item.count)
    ]));

    doc.addPage();

    // --- Section 4: Product Inventory ---
    addSection(doc, 'Product Inventory');
    drawUniformTable(doc, ['Fragrance', 'Brand', 'Price', 'Status'], products.map(item => [
      item.fragrance_name,
      item.brand_name,
      `€${Number(item.price).toFixed(2)}`,
      item.availability
    ]));



    doc.end();
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Failed to generate vendor performance report' });
  }
};

// // 3. User Demographics Report
export const userDemographicsReport = async (req, res) => {
  try {
    // User counts by age range
    const ageRanges = await UserPersonalTaste.findAll({
      attributes: [
        'age_range',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['age_range'],
      order: [[col('age_range'), 'ASC']],
      raw: true
    });

    // User counts by occasion preference
    const occasionPrefs = await UserPersonalTaste.findAll({
      attributes: [
        'occasion',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['occasion'],
      raw: true
    });

    // User counts by smell preference
    const smellPrefs = await UserPersonalTaste.findAll({
      attributes: [
        'smell',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['smell'],
      raw: true
    });

    // User counts by intensity preference
    const intensityPrefs = await UserPersonalTaste.findAll({
      attributes: [
        'intensity',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['intensity'],
      raw: true
    });

    // Calculate total users
    const totalUsers = ageRanges.reduce((sum, item) => sum + parseInt(item.count), 0);

    // Find most common demographics
    const mostCommonAge = [...ageRanges].sort((a, b) => b.count - a.count)[0] || { age_range: 'N/A', count: 0 };
    const mostPopularOccasion = [...occasionPrefs].sort((a, b) => b.count - a.count)[0] || { occasion: 'N/A', count: 0 };
    const mostPopularSmell = [...smellPrefs].sort((a, b) => b.count - a.count)[0] || { smell: 'N/A', count: 0 };

    // PDF generation
    const today = new Date().toLocaleDateString();
    const doc = createPdfDoc(res, `user-demographics-${today}.pdf`);

    addHeader(doc, 'User Demographics Report');
    doc.fontSize(10).text(`Generated on: ${today}`, { align: 'right' });
    doc.moveDown(1.5);

    // --- Page 1: Overall User Demographics Summary ---
    addSection(doc, 'User Demographics Summary', 'left');

    // Create summary data
    const summaryData = [
      ['Total Registered Users:', totalUsers.toString()],
      ['Most Common Age Range:', `${mostCommonAge.age_range} (${mostCommonAge.count} users)`],
      ['Most Popular Occasion:', `${mostPopularOccasion.occasion} (${mostPopularOccasion.count} users)`],
      ['Most Popular Fragrance Type:', `${mostPopularSmell.smell} (${mostPopularSmell.count} users)`]
    ];

    drawUniformTable(doc, ['Metric', 'Value'], summaryData);
    doc.moveDown(1.5);

    // Age Distribution Section with percentages
    addSection(doc, 'Age Distribution', 'left');
    drawUniformTable(doc,
      ['Age Range', 'Count', 'Percentage'],
      ageRanges.map(item => [
        item.age_range || 'Unknown',
        String(item.count || '0'),
        `${((parseInt(item.count) / totalUsers) * 100).toFixed(1)}%`
      ])
    );

    doc.addPage(); // ➤ move to next page

    // --- Page 2: Occasion Preferences ---
    addSection(doc, 'Occasion Preferences', 'left');
    drawUniformTable(doc,
      ['Occasion', 'Count', 'Percentage'],
      occasionPrefs.map(item => [
        item.occasion || 'Unknown',
        String(item.count || '0'),
        `${((parseInt(item.count) / totalUsers) * 100).toFixed(1)}%`
      ])
    );
    doc.moveDown(1.5);

    // Fragrance Type Preferences
    addSection(doc, 'Fragrance Type Preferences', 'left');
    drawUniformTable(doc,
      ['Fragrance Type', 'Count', 'Percentage'],
      smellPrefs.map(item => [
        item.smell || 'Unknown',
        String(item.count || '0'),
        `${((parseInt(item.count) / totalUsers) * 100).toFixed(1)}%`
      ])
    );

    doc.addPage(); // ➤ move to next page

    // --- Page 3: Intensity Preferences ---
    addSection(doc, 'Fragrance Intensity Preferences', 'left');
    drawUniformTable(doc,
      ['Intensity', 'Count', 'Percentage'],
      intensityPrefs.map(item => [
        item.intensity || 'Unknown',
        String(item.count || '0'),
        `${((parseInt(item.count) / totalUsers) * 100).toFixed(1)}%`
      ])
    );
    doc.moveDown(2);


    doc.end();
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Failed to generate user demographics report' });
  }
};
// 4. Wishlist Analytics Report
export const wishlistAnalyticsReport = async (req, res) => {
  try {
    // --- Top Fragrances Query ---
    const topFragrances = await Wishlist.findAll({
      attributes: [
        [col('fragrance.id'), 'fragrance_id'],
        [col('fragrance.name'), 'fragrance_name'],
        [col('fragrance->brand.name'), 'brand_name'],
        [fn('COUNT', col('Wishlist.id')), 'wishlist_count']
      ],
      include: [{
        model: Fragrance,
        as: 'fragrance',
        include: [{ model: Brand, as: 'brand' }]
      }],
      group: ['fragrance.id', 'fragrance.name', 'fragrance->brand.name'],
      order: [[fn('COUNT', col('Wishlist.id')), 'DESC']],
      limit: 15,
      raw: true
    });

    // --- Brand Wishlist Counts ---
    const brandWishlists = await Wishlist.findAll({
      attributes: [
        [col('fragrance->brand.id'), 'brand_id'],
        [col('fragrance->brand.name'), 'brand_name'],
        [fn('COUNT', col('Wishlist.id')), 'wishlist_count']
      ],
      include: [{
        model: Fragrance,
        as: 'fragrance',
        attributes: [],
        include: [{
          model: Brand,
          as: 'brand',
          attributes: []
        }]
      }],
      group: ['fragrance->brand.id', 'fragrance->brand.name'],
      order: [[fn('COUNT', col('Wishlist.id')), 'DESC']],
      raw: true
    });

    // --- Create PDF ---
    const today = new Date().toLocaleDateString();
    const doc = createPdfDoc(res, `wishlist-analytics-${today}.pdf`);

    addHeader(doc, 'Wishlist Analytics Report');
    doc.fontSize(10).text(`Generated on: ${today}`, { align: 'right' });
    doc.moveDown(1.5);

    // --- Section 1: Top Wishlisted Fragrances ---
    addSection(doc, 'Top 15 Most Wishlisted Fragrances');
    drawUniformTable(doc, ['#', 'Fragrance Name', 'Brand', 'Wishlists'], topFragrances.map((item, i) => [
      `${i + 1}`,
      item.fragrance_name,
      item.brand_name,
      String(item.wishlist_count)
    ]));

    doc.addPage();

    // --- Section 2: Brand Popularity ---
    addSection(doc, 'Brand Popularity by Wishlist Counts', 'left');
    drawUniformTable(doc, ['#', 'Brand', 'Total Wishlists'], brandWishlists.map((item, i) => [
      `${i + 1}`,
      item.brand_name,
      String(item.wishlist_count)
    ]));

    doc.end();
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Failed to generate wishlist analytics report' });
  }
};
// 5. Product Availability Report
export const productAvailabilityReport = async (req, res) => {
  try {
    const products = await VendorProduct.findAll({
      attributes: [
        [col('product.fragrance.name'), 'fragrance_name'],
        [col('product.brand.name'), 'brand_name'],
        [fn('GROUP_CONCAT', col('VendorProduct.availability')), 'availability_list'],
        [fn('COUNT', col('VendorProduct.id')), 'vendor_count']
      ],
      include: [{
        model: Product,
        as: 'product',
        include: [
          { model: Fragrance, as: 'fragrance' },
          { model: Brand, as: 'brand' }
        ]
      }],
      group: ['product.id'],
      raw: true
    });

    const availabilitySummary = await VendorProduct.findAll({
      attributes: [
        'availability',
        [fn('COUNT', col('VendorProduct.id')), 'count']
      ],
      group: ['availability'],
      raw: true
    });

    const today = new Date().toLocaleDateString();
    const doc = createPdfDoc(res, `product-availability-${today}.pdf`);

    addHeader(doc, 'Product Availability Report');
    doc.fontSize(10).text(`Generated on: ${today}`, { align: 'right' });
    doc.moveDown(1.5);

    // --- Page 1: Overall Availability Summary ---
    addSection(doc, 'Overall Availability Summary', 'left');
    drawUniformTable(doc, ['Status', 'Count'], availabilitySummary.map(({ availability, count }) => [
      availability,
      String(count)
    ]));

    doc.addPage(); // ➤ move to next page

    // --- Page 2: Product Availability Details ---
    addSection(doc, 'Product Availability Details', 'left');
    drawUniformTable(doc, ['Fragrance', 'Brand', 'Vendors', 'Status'], products.map(product => {
      const availabilityArr = product.availability_list.split(',');
      const hasInStock = availabilityArr.includes('In stock');
      const status = hasInStock ? 'Available' : 'Out of Stock';

      return [
        product.fragrance_name,
        product.brand_name,
        String(product.vendor_count),
        status
      ];
    }));

    doc.end();
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Failed to generate product availability report' });
  }
};

// 6. Marketing Performance Report
export const marketingPerformanceReport = async (req, res) => {
  try {
    // Fetch ad placements summary
    const adPlacements = await Advertisement.findAll({
      attributes: [
        'placement',
        [fn('COUNT', col('id')), 'ad_count'],
        [fn('AVG', col('price')), 'avg_price']
      ],
      group: ['placement'],
      raw: true
    });

    // Fetch advertisement details
    const ads = await Advertisement.findAll({
      attributes: [
        'id',
        'description',
        'placement',
        'price',
        'startDate',
        'endDate',
        [col('BusinessInfo.companyName'), 'company']
      ],
      include: [{ model: BusinessInfo }],
      order: [['startDate', 'DESC']],
      raw: true
    });

    const today = new Date().toLocaleDateString();
    const doc = createPdfDoc(res, `marketing-performance-${today}.pdf`);

    addHeader(doc, 'Marketing Performance Report');
    doc.fontSize(10).text(`Generated on: ${today}`, { align: 'right' });
    doc.moveDown(1.5);

    // --- Page 1: Ad Placement Summary ---
    addSection(doc, 'Ad Placement Summary', 'left');
    drawUniformTable(doc, ['Placement', 'Ad Count', 'Average Price'],
      adPlacements.map(({ placement, ad_count, avg_price }) => [
        placement,
        String(ad_count),
        `€${Number(avg_price).toFixed(2)}`
      ])
    );

    doc.addPage();

    // --- Page 2: Recent Advertisement Campaigns ---
    addSection(doc, 'Recent Advertisement Campaigns', 'left');
    drawUniformTable(doc, ['Company', 'Placement', 'Price', 'Duration'],
      ads.slice(0, 10).map(ad => {
        const startDate = new Date(ad.startDate).toLocaleDateString();
        const endDate = new Date(ad.endDate).toLocaleDateString();
        return [
          ad.company,
          ad.placement,
          `€${ad.price}`,
          `${startDate} - ${endDate}`
        ];
      })
    );

    doc.end();

  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Failed to generate marketing performance report' });
  }
};

// 7. Brand Performance Report
export const brandPerformanceReport = async (req, res) => {
  try {
    const bid = req.params.id;

    // Validate brand existence
    const brand = await Brand.findByPk(bid);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Fetch all fragrances for the brand
    const fragrances = await Fragrance.findAll({
      where: { bid },
      attributes: ['id', 'name'],
      raw: true
    });

    // Gather wishlist count & vendor count for each fragrance
    const fragrancePopularity = await Promise.all(
      fragrances.map(async (fragrance) => {
        const wishlistCount = await Wishlist.count({
          where: { fragrance_id: fragrance.id }
        });

        const vendorCount = await VendorProduct.count({
          include: [{
            model: Product,
            as: 'product',
            where: { fragrance_id: fragrance.id }
          }]
        });

        return {
          ...fragrance,
          wishlist_count: wishlistCount,
          vendor_count: vendorCount
        };
      })
    );

    // Sort fragrances by wishlist count (descending)
    fragrancePopularity.sort((a, b) => b.wishlist_count - a.wishlist_count);

    // Prepare PDF report
    const today = new Date().toLocaleDateString();
    const fileName = `brand-performance-${brand.name.replace(/\s+/g, '-')}-${today}.pdf`;
    const doc = createPdfDoc(res, fileName);

    addHeader(doc, `Brand Performance Report: ${brand.name}`);
    doc.fontSize(10).text(`Generated on: ${today}`, { align: 'right' });
    doc.moveDown(1.5);

    // --- Page 1: Brand Information Section ---
    addSection(doc, 'Brand Information', 'left');
    drawUniformTable(doc, ['Detail', 'Value'], [
      ['Brand Name', brand.name],
      ['Total Fragrances', String(fragrances.length)]
    ]);



    // --- Page 2: Fragrance Popularity Ranking ---

    addSection(doc, 'Fragrance Popularity Ranking', 'left');

    // Map the fragrances data to match the uniform table format
    const fragranceRows = fragrancePopularity.map((fragrance, idx) => [
      `${idx + 1}`,
      fragrance.name,
      String(fragrance.wishlist_count),
      String(fragrance.vendor_count)
    ]);

    drawUniformTable(doc, ['Rank', 'Fragrance', 'Wishlists', 'Vendors'], fragranceRows);

    doc.end();
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Failed to generate brand performance report' });
  }
};

// 8. User Preferences Report
// export const userPreferencesReport = async (req, res) => {
//   try {
//     // Get preferences by gender preference
//     const genderPrefs = await UserPersonalTaste.findAll({
//       attributes: [
//         'looking_for',
//         [fn('COUNT', col('id')), 'count']
//       ],
//       group: ['looking_for'],
//       raw: true
//     });

//     // Get top fragrance notes - Fixed association reference
// const topNotes = await UserFavoriteNote.findAll({
//   attributes: [
//     [col('note.name'), 'note_name'],  // lowercase 'note' to match alias
//     [fn('COUNT', col('UserFavoriteNote.id')), 'count']
//   ],
//   include: [{ 
//     model: Note, 
//     as: 'note', 
//     attributes: [] 
//   }],
//   group: ['note.id'],
//   order: [[fn('COUNT', col('UserFavoriteNote.id')), 'DESC']],
//   limit: 10,
//   raw: true
// });

//     // PDF Generation
//     const today = new Date().toLocaleDateString();
//     const doc = createPdfDoc(res, `user-preferences-${today}.pdf`);

//     addHeader(doc, 'User Preferences Report');

//     // Gender Preferences
//     addSection(doc, 'Gender Preferences');
//     tableHeader(doc, [
//       { w: 200, text: 'Looking For' },
//       { w: 'end', text: 'Count' }
//     ]);
//     genderPrefs.forEach(({ looking_for, count }) =>
//       tableRow(doc, [
//         { w: 200, text: looking_for },
//         { w: 'end', text: String(count) }
//       ])
//     );

//     // Popular Fragrance Notes
//     if (topNotes.length > 0) {
//       addSection(doc, 'Top 10 Favorite Fragrance Notes');
//       tableHeader(doc, [
//         { w: 30, text: 'Rank' },
//         { w: 200, text: 'Note Name' },
//         { w: 'end', text: 'Users Count' }
//       ]);

//       topNotes.forEach((note, idx) =>
//         tableRow(doc, [
//           { w: 30, text: `${idx + 1}.` },
//           { w: 200, text: note.note_name },
//           { w: 'end', text: String(note.count) }
//         ])
//       );
//     }

//     // Cross-reference analysis
//     addSection(doc, 'Preference Combinations Analysis');

//     // Age group and smell preference correlation
//     const ageSmellCorrelation = await UserPersonalTaste.findAll({
//       attributes: [
//         'age_range',
//         'smell',
//         [fn('COUNT', col('id')), 'count']
//       ],
//       group: ['age_range', 'smell'],
//       order: [['age_range', 'ASC'], [fn('COUNT', col('id')), 'DESC']],
//       raw: true
//     });

//     // Display the most popular smell for each age group
//     const ageGroups = [...new Set(ageSmellCorrelation.map(item => item.age_range))];

//     tableHeader(doc, [
//       { w: 150, text: 'Age Group' },
//       { w: 150, text: 'Favorite Smell' },
//       { w: 'end', text: 'Count' }
//     ]);

//     ageGroups.forEach(ageGroup => {
//       const topSmell = ageSmellCorrelation
//         .filter(item => item.age_range === ageGroup)
//         .sort((a, b) => b.count - a.count)[0];

//       if (topSmell) {
//         tableRow(doc, [
//           { w: 150, text: ageGroup },
//           { w: 150, text: topSmell.smell },
//           { w: 'end', text: String(topSmell.count) }
//         ]);
//       }
//     });

//     doc.end();
//   } catch (err) {
//     console.error('Report error:', err);
//     res.status(500).json({ message: 'Failed to generate user preferences report' });
//   }
// };

// 9. Price Analysis Report
export const priceAnalysisReport = async (req, res) => {
  try {
    // Get price statistics by brand - fix grouping to include all non-aggregated columns used in SELECT
    const brandPrices = await VendorProduct.findAll({
      attributes: [
        [col('product.brand.id'), 'brand_id'],
        [col('product.brand.name'), 'brand'],
        [col('product.id'), 'product_id'],
        [col('product.fragrance_id'), 'product_fragrance_id'],
        [col('product.brand_id'), 'product_brand_id'],
        [col('product.brand.description'), 'brand_description'],
        [col('product.brand.image'), 'brand_image'],
        [fn('MIN', col('price')), 'min_price'],
        [fn('MAX', col('price')), 'max_price'],
        [fn('AVG', col('price')), 'avg_price'],
        [fn('COUNT', col('VendorProduct.id')), 'count']
      ],
      include: [{
        model: Product,
        as: 'product',
        attributes: [],  // Exclude raw product columns (to avoid duplication, since included via grouping)
        include: [{
          model: Brand,
          as: 'brand',
          attributes: []  // Same here, selected only via col() in attributes
        }]
      }],
      group: [
        'product.brand.id',
        'product.brand.name',
        'product.id',
        'product.fragrance_id',
        'product.brand_id',
        'product.brand.description',
        'product.brand.image'
      ],
      having: where(fn('COUNT', col('VendorProduct.id')), '>', 2),
      order: [[fn('AVG', col('price')), 'DESC']],
      raw: true
    });

    // Get overall price statistics
    const priceStats = await VendorProduct.findAll({
      attributes: [
        [fn('MIN', col('price')), 'min_price'],
        [fn('MAX', col('price')), 'max_price'],
        [fn('AVG', col('price')), 'avg_price'],
        [fn('STDDEV', col('price')), 'stddev_price']
      ],
      raw: true
    });

    // Get price distribution with raw SQL query (simpler for CASE logic)
    const priceDistribution = await sequelize.query(`
      SELECT 
        CASE 
          WHEN price < 50 THEN 'Under €50'
          WHEN price >= 50 AND price < 100 THEN '€50-€100'
          WHEN price >= 100 AND price < 150 THEN '€100-€150'
          WHEN price >= 150 AND price < 200 THEN '€150-€200'
          WHEN price >= 200 AND price < 300 THEN '€200-€300'
          ELSE 'Over €300'
        END as price_range,
        COUNT(*) as count
      FROM vendor_products 
      GROUP BY price_range
      ORDER BY MIN(price)
    `, { type: sequelize.QueryTypes.SELECT });

    // PDF generation logic
    const today = new Date().toLocaleDateString();
    const doc = createPdfDoc(res, `price-analysis-${today}.pdf`);

    addHeader(doc, 'Price Analysis Report');
    doc.fontSize(10).text(`Generated on: ${today}`, { align: 'right' });
    doc.moveDown(1.5);

    // --- Page 1: Overall Price Statistics ---
    addSection(doc, 'Overall Price Statistics', 'left');
    const stats = priceStats[0];

    // Convert stats to array for uniform table
    const statsData = [
      ['Lowest Price:', `€${Number(stats.min_price).toFixed(2)}`],
      ['Highest Price:', `€${Number(stats.max_price).toFixed(2)}`],
      ['Average Price:', `€${Number(stats.avg_price).toFixed(2)}`],
      ['Standard Deviation:', `€${Number(stats.stddev_price).toFixed(2)}`]
    ];

    drawUniformTable(doc, ['Metric', 'Value'], statsData);
    doc.moveDown(1);

    // Price Distribution section
    addSection(doc, 'Price Distribution', 'left');
    drawUniformTable(doc,
      ['Price Range', 'Count'],
      priceDistribution.map(({ price_range, count }) => [
        price_range,
        String(count)
      ])
    );

    doc.addPage(); // ➤ move to next page

    // --- Page 2: Brand Price Analysis ---
    addSection(doc, 'Brand Price Analysis', 'left');
    drawUniformTable(doc,
      ['Brand', 'Min Price', 'Max Price', 'Avg Price', 'Products'],
      brandPrices.map(brand => [
        brand.brand,
        `€${Number(brand.min_price).toFixed(2)}`,
        `€${Number(brand.max_price).toFixed(2)}`,
        `€${Number(brand.avg_price).toFixed(2)}`,
        String(brand.count)
      ])
    );

    doc.end();
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Failed to generate price analysis report' });
  }
};
//9. Vendor Verification Report
export const vendorVerificationReport = async (req, res) => {
  try {
    // Get verification status counts
    const verificationStats = await BusinessInfo.findAll({
      attributes: [
        'verification',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['verification'],
      raw: true
    });

    // Get vendors with their verification status and product count
    const vendors = await BusinessInfo.findAll({
      attributes: [
        'id',
        'companyName',
        'verification',
        'address',
        'phoneOffice',
        [fn('COUNT', col('companyOffers.id')), 'product_count']
      ],
      include: [{
        model: VendorProduct,
        as: 'companyOffers',
        attributes: []
      }],
      group: ['BusinessInfo.id'],
      raw: true
    });

    // PDF Generation
    const today = new Date().toLocaleDateString();


    const doc = createPdfDoc(res, `vendor-verification-${today}.pdf`);

    addHeader(doc, 'Vendor Verification Status Report');
    doc.fontSize(10).text(`Generated on: ${today}`, { align: 'right' });
    doc.moveDown(1.5);

    // --- Page 1: Overall Statistics ---
    addSection(doc, 'Verification Status Summary', 'left');
    drawUniformTable(doc,
      ['Status', 'Count'],
      verificationStats.map(({ verification, count }) => [
        verification,
        String(count)
      ])
    );
    doc.moveDown(1);

    doc.addPage(); // ➤ move to next page

    // --- Page 2: Vendor Details ---
    addSection(doc, 'Vendor Details', 'left');
    drawUniformTable(doc,
      ['Company Name', 'Status', 'Products', 'Contact'],
      vendors.map(vendor => [
        vendor.companyName,
        vendor.verification,
        String(vendor.product_count),
        vendor.address || vendor.phoneOffice || 'N/A'
      ])
    );

    doc.end();
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Failed to generate vendor verification report' });
  }
};

export const productHitCountsReport = async (req, res) => {
  try {
    const fragrances = await Fragrance.findAll();

    // Get click statistics for all fragrances
    const clickStats = await FragranceClick.findAll({
      attributes: [
        'fragranceId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalClicks'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'uniqueUserClicks']
      ],
      group: ['fragranceId'],
      raw: true
    });

    // Combine fragrance data with click statistics
    const result = fragrances.map(fragrance => {
      const stats = clickStats.find(stat => stat.fragranceId === fragrance.id) || {
        fragranceId: fragrance.id,
        totalClicks: 0,
        uniqueUserClicks: 0
      };
      
      return {
        fragranceId: fragrance.id,
        fragranceName: fragrance.name,
        totalClicks: stats.totalClicks,
        uniqueUserClicks: stats.uniqueUserClicks
      };
    });

    const today = new Date().toLocaleDateString();
    const doc = createPdfDoc(res, `product-hit-counts-${today}.pdf`);

    // Add report header
    addHeader(doc, 'Product Hit Counts Report');
    doc.fontSize(10).text(`Generated on: ${today}`, { align: 'right' });
    doc.moveDown(1.5);

    // Pagination settings
    const rowsPerPage = 25; // Adjust based on your layout
    const totalPages = Math.ceil(result.length / rowsPerPage);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        doc.addPage();
        // Add header for subsequent pages
        addHeader(doc, 'Product Hit Counts Report (Continued)');
        doc.fontSize(10).text(`Generated on: ${today}`, { align: 'right' });
        doc.moveDown(1.5);
      }

      // Get the chunk of data for this page
      const startIdx = page * rowsPerPage;
      const endIdx = startIdx + rowsPerPage;
      const pageData = result.slice(startIdx, endIdx);

      // Add table with the click data for this page
      drawUniformTable(doc,
        ['Fragrance ID', 'Fragrance Name', 'Total Clicks', 'Unique Clicks'],
        pageData.map(data => [
          data.fragranceId.toString(),
          data.fragranceName,
          data.totalClicks.toString(),
          data.uniqueUserClicks.toString()
        ])
      );

      // Add page footer with pagination info
      doc.moveDown(1);
      doc.fontSize(10).text(`Page ${page + 1} of ${totalPages}`, { align: 'center' });
    }

    doc.end();
  } catch (error) {
    console.error('Error generating product hit counts report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate report',
      error: error.message 
    });
  }
}