import { Advertisement } from '../models/Advertisement.js';
import { BusinessInfo } from '../models/BusinessInfo.js';

export const getAllOffers = async (req, res) => {
  try {
    const offers = await Advertisement.findAll({
      where: {
        payment_status: 2,
        is_published: true
      },
    });

    res.json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching offers' });
  }
};

export const getWebsiteUrlByCompany = async (req, res) => {
  try {
    const { offerId } = req.params;

    // Fetch the offer and validate it's paid and published
    const offer = await Advertisement.findOne({
      where: {
        id: offerId,
        payment_status: 2,
        is_published: true
      }
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found or not eligible (unpaid or unpublished)' });
    }

    // Fetch the associated BusinessInfo (company)
    const businessInfo = await BusinessInfo.findOne({
      where: { id: offer.company_id }
    });

    if (!businessInfo) {
      return res.status(404).json({ error: 'Associated business not found' });
    }

    return res.json(businessInfo);

  } catch (error) {
    console.error('Error fetching website URL by offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


