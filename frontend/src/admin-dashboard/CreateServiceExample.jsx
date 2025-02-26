import React, { useState } from "react";
import axios from "axios";

const CreateServiceExample = () => {
  const [formData, setFormData] = useState({
    title: "Six Islands Kivu Tours",
    description:
      "Discover six unique islands including Punishment, Peace, and Farm Islands. Each offers a blend of cultural heritage, lush landscapes, and recreational activities.",
    detailPage: "six-islands-kivu-tours",
    details: {
      highlights: [
        "Guided boat tour on Lake Kivu",
        "Explore Napoleon Island, Monkey Island, Peace Island, Volcano Island, Plantation Island, and Punishment Island",
        "Blend of history, culture, and natural beauty",
      ],
      tips: [
        "Soft Drinks Included",
        "Experienced Guide",
        "Affordable price for this service",
      ],
      contact: {
        whatsapp: "https://wa.me/250784606393",
        email: "mailto:jeandamourrwibutso@gmail.com",
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
        highlights: formData.details.highlights,
        tips: formData.details.tips,
        contact: formData.details.contact,
      })
    );
    if (formData.imageFile) {
      data.append("imageFile", formData.imageFile);
    }

    try {
      const response = await axios.post(
        "https://kivu-back-end.onrender.com/api/services",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
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
        value={formData.details.highlights.join(", ")}
        onChange={handleDetailsChange}
        placeholder="Highlights (comma separated)"
        required
      />
      <input
        type="text"
        name="tips"
        value={formData.details.tips.join(", ")}
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

export default CreateServiceExample;
