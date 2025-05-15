import { Advertisement } from '../models/Advertisement.js';
import { BusinessInfo } from '../models/BusinessInfo.js';

export const getAllOffers = async (req, res) => {
  try {
    const offers = await Advertisement.findAll();
    res.json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching offers' });
  }
};
export const getWebsiteUrlByCompany = async (req, res) => {
  try {
    const { offerId } = req.params;

    // First, fetch the offer to ensure it exists
    const offer = await Advertisement.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Now, fetch the associated BusinessInfo (company) using the company_id from the offer
    const businessInfo = await BusinessInfo.findOne({
      where: { id: offer.company_id }, // Use the company_id from the offer
    });

    if (!businessInfo) {
      return res.status(404).json({ error: 'Associated business not found' });
    }

    // Return the entire businessInfo object
    return res.json(businessInfo);

  } catch (error) {
    console.error('Error fetching website URL by offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

