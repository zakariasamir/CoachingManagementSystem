import { Organization } from "../models/organization.model.js";

const createOrganization = async (req, res) => {
  const name = req.body.name;
  if (!name) {
    return res.status(400).json({ message: "Organization name is required" });
  }
  try {
    const newOrganization = new Organization({ name });
    await newOrganization.save();
    res.status(201).json({ message: "Organization created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating organization", error });
  }
};
const getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching organizations", error });
  }
};

const getOrganizationById = async (req, res) => {
  const organizationId = req.params.id;
  if (!organizationId) {
    return res.status(400).json({ message: "Organization ID is required" });
  }
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.status(200).json(organization);
  } catch (error) {
    res.status(500).json({ message: "Error fetching organization", error });
  }
};

const deleteOrganization = async (req, res) => {
  const organizationId = req.params.id;
  if (!organizationId) {
    return res.status(400).json({ message: "Organization ID is required" });
  }
  try {
    const organization = await Organization.findByIdAndDelete(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting organization", error });
  }
};

export {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  deleteOrganization,
};
