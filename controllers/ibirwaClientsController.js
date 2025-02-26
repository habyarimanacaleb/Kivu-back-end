const IbirwaClient = require("../models/IbirwaClient");

// Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await IbirwaClient.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clients", error });
  }
};

// Get a single client by ID
exports.getClientById = async (req, res) => {
  try {
    const client = await IbirwaClient.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Error fetching client", error });
  }
};

// Create a new client
exports.createClient = async (req, res) => {
  try {
    const newClient = new IbirwaClient(req.body);
    await newClient.save();
    res
      .status(201)
      .json({ message: "Client created successfully", client: newClient });
  } catch (error) {
    res.status(500).json({ message: "Error creating client", error });
  }
};

// Update a client by ID
exports.updateClientById = async (req, res) => {
  try {
    const updatedClient = await IbirwaClient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedClient)
      return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client updated successfully", client: updatedClient });
  } catch (error) {
    res.status(500).json({ message: "Error updating client", error });
  }
};

// Delete a client by ID
exports.deleteClientById = async (req, res) => {
  try {
    const deletedClient = await IbirwaClient.findByIdAndDelete(req.params.id);
    if (!deletedClient)
      return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client", error });
  }
};
