import React, { useState } from "react";
import axios from "axios";

const CreateServices = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    detailPage: "",
    details: {
      highlights: [],
      tips: [],
      contact: {
        whatsapp: "",
        email: "",
      },
    },
    imageFile: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      details: { ...formData.details, [name]: value },
    });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, imageFile: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("detailPage", formData.detailPage);
    data.append(
      "details",
      JSON.stringify({
        ...formData.details,
        highlights: JSON.stringify(formData.details.highlights),
        tips: JSON.stringify(formData.details.tips),
      })
    );
    if (formData.imageFile) {
      data.append("imageFile", formData.imageFile);
    }

    try {
      const response = await axios.post("/api/services", data);
      console.log("Service created:", response.data);
    } catch (error) {
      console.error(
        "Error creating service:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Title"
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        required
      />
      <input
        type="text"
        name="detailPage"
        value={formData.detailPage}
        onChange={handleChange}
        placeholder="Detail Page"
        required
      />
      <input
        type="text"
        name="highlights"
        value={formData.details.highlights}
        onChange={handleDetailsChange}
        placeholder="Highlights (comma separated)"
        required
      />
      <input
        type="text"
        name="tips"
        value={formData.details.tips}
        onChange={handleDetailsChange}
        placeholder="Tips (comma separated)"
        required
      />
      <input
        type="text"
        name="whatsapp"
        value={formData.details.contact.whatsapp}
        onChange={handleDetailsChange}
        placeholder="WhatsApp"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.details.contact.email}
        onChange={handleDetailsChange}
        placeholder="Email"
        required
      />
      <input type="file" name="imageFile" onChange={handleFileChange} />
      <button type="submit">Create Service</button>
    </form>
  );
};

export default CreateServices;
