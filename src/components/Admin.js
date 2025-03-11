import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ENTRYPOINT } from '../config/entrypoint';
import { useNavigate } from 'react-router-dom';
import Flow from '@flowjs/flow.js';

function Admin() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [updatedSettings, setUpdatedSettings] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${ENTRYPOINT}/settings`)
      .then(response => {
        setSettings(response.data);
        setUpdatedSettings(response.data); // initialize form values
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur lors du chargement des paramètres');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  const handleLogout = () => {
    localStorage.removeItem("logged");
    navigate('/');
  };

  const handleDisplay = () => {
    setEditMode(true);
    setUploadMode(false);
  };

  // Updated upload handler to toggle the upload form instead of navigating.
  const handleUpload = () => {
    setUploadMode(true);
    setEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Send updated settings via PUT request (adjust endpoint as needed)
    axios.put(`${ENTRYPOINT}/settings`, updatedSettings)
      .then(response => {
        setSettings(response.data);
        setEditMode(false);
      })
      .catch(err => {
        setError('Erreur lors de la mise à jour des paramètres');
      });
  };

  // Handlers for upload form
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    var flow = new Flow({
      target: `${ENTRYPOINT}/upload`,
      chunkSize: 1024 * 1024, // example chunk size (1MB)
      singleFile: true
    });

    selectedFile.uniqueIdentifier = flow.generateUniqueIdentifier(selectedFile);
    flow.addFile(selectedFile);
    let fileslot = document.createElement("div");
    fileslot.id = selectedFile.uniqueIdentifier;
    fileslot.innerHTML = `${selectedFile.name} (${selectedFile.size}) - <strong>0%</strong>`;
    document.getElementById("list").appendChild(fileslot);

    flow.upload();

    flow.on('fileSuccess', function(file, message) {
      alert("File uploaded successfully");
      setUploadMode(false);
      setSelectedFile(null);
    });

    flow.on("fileProgress", function(file, chunk) {
        let progress = (chunk.offset + 1) / file.chunks.length * 100;
        progress = progress.toFixed(2) + "%";
        let fileslot = document.getElementById(file.uniqueIdentifier);
        fileslot = fileslot.getElementsByTagName("strong")[0];
        fileslot.innerHTML = progress;
      });

    flow.on('fileError', function(file, message) {
      alert("File upload failed: " + message);
    });
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Left menu */}
      <div style={{ width: "200px", borderRight: "1px solid #ccc", padding: "10px" }}>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          <li style={{ marginBottom: "10px" }}>
            <button style={{ width: "100%" }} onClick={handleDisplay}>Display</button>
          </li>
          <li style={{ marginBottom: "10px" }}>
            <button style={{ width: "100%" }} onClick={handleUpload}>Upload</button>
          </li>
          <li style={{ marginBottom: "10px" }}>
            <button style={{ width: "100%" }}>Password</button>
          </li>
          <li style={{ marginBottom: "10px" }}>
            <button style={{ width: "100%" }} onClick={handleLogout}>Logout</button>
          </li>
          <li style={{ marginBottom: "10px" }}>
            <button style={{ width: "100%" }} onClick={() => navigate('/')}>Back</button>
          </li>
        </ul>
      </div>

      {/* Settings content */}
      <div style={{ flex: 1, padding: "10px" }}>
        <h1>Paramètres de l'application</h1>
        {uploadMode ? (
          <form onSubmit={handleUploadSubmit}>
            <div style={{ marginBottom: "10px" }}>
              <label>Choisissez un fichier : </label>
              <input type="file" onChange={handleFileChange} />
              {/* <input type="file" id="upBrowse" value="Browse" onChange={handleFileChange}/> */}

            </div>
            <button type="submit">Upload File</button>
            <button type="button" onClick={() => setUploadMode(false)}>Annuler</button>
            <div id="list"></div>
          </form>
        ) : editMode ? (
          <form onSubmit={handleFormSubmit}>
            <div style={{ marginBottom: "10px" }}>
              <label>App Name: </label>
              <input 
                type="text" 
                name="appName" 
                value={updatedSettings.appName || ""} 
                onChange={handleInputChange} 
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Gallery Screen Size: </label>
              <input 
                type="text" 
                name="galleryScreenSize" 
                value={updatedSettings.galleryScreenSize || ""} 
                onChange={handleInputChange} 
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Gallery Screen Cols: </label>
              <input 
                type="text" 
                name="galleryScreenCols" 
                value={updatedSettings.galleryScreenCols || ""} 
                onChange={handleInputChange} 
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Content Screen Size: </label>
              <input 
                type="text" 
                name="contentScreenSize" 
                value={updatedSettings.contentScreenSize || ""} 
                onChange={handleInputChange} 
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Content Screen Cols: </label>
              <input 
                type="text" 
                name="contentScreenCols" 
                value={updatedSettings.contentScreenCols || ""} 
                onChange={handleInputChange} 
              />
            </div>
            <button type="submit">Enregistrer</button>
            <button type="button" onClick={() => setEditMode(false)}>Annuler</button>
          </form>
        ) : (
          <pre>{JSON.stringify(settings, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}

export default Admin;