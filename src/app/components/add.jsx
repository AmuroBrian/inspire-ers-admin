'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '@/firebase/firebaseConfig';
import { storage } from '@/firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddModal = ({ isOpen, onClose, onAdd }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showVersionSuggestions, setShowVersionSuggestions] = useState(false);
  const [filteredVersions, setFilteredVersions] = useState([]);

  const platforms = ['Windows', 'macOS', 'Linux'];
  const versions = [
    'v1', 'v1.1', 'v1.2', 'v1.3', 'v1.4', 'v1.5',
    'v2', 'v2.1', 'v2.2', 'v2.3', 'v2.4', 'v2.5',
    'v3', 'v3.1', 'v3.2', 'v3.3', 'v3.4', 'v3.5',
    'v4', 'v4.1', 'v4.2', 'v4.3', 'v4.4', 'v4.5',
    'v5', 'v5.1', 'v5.2', 'v5.3', 'v5.4', 'v5.5',
    'v6', 'v6.1', 'v6.2', 'v6.3', 'v6.4', 'v6.5',
    'v7', 'v7.1', 'v7.2', 'v7.3', 'v7.4', 'v7.5',
    'v8', 'v8.1', 'v8.2', 'v8.3', 'v8.4', 'v8.5',
    'v9', 'v9.1', 'v9.2', 'v9.3', 'v9.4', 'v9.5'
  ];

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNextVersions = (platform) => {
    // Get all versions for the selected platform from table data
    const platformVersions = tableData
      .filter(item => item.platform === platform)
      .map(item => item.version)
      .sort();
    
    if (platformVersions.length === 0) {
      // If no versions exist for this platform, only suggest v1
      return ['v1'];
    }
    
    // Get the highest version for this platform
    const highestVersion = platformVersions[platformVersions.length - 1];
    
    // Extract version numbers (e.g., v3 -> 3, v2.1 -> 2.1)
    const versionMatch = highestVersion.match(/v(\d+)(?:\.(\d+))?/);
    if (!versionMatch) return ['v1'];
    
    const majorVersion = parseInt(versionMatch[1]);
    const minorVersion = versionMatch[2] ? parseInt(versionMatch[2]) : 0;
    
    const suggestions = [];
    
    // If the highest version is a whole number (e.g., v3), suggest v3.1 to v3.9
    if (minorVersion === 0) {
      for (let i = 1; i <= 9; i++) {
        suggestions.push(`v${majorVersion}.${i}`);
      }
      // Also suggest next major version
      suggestions.push(`v${majorVersion + 1}`);
    } else {
      // If the highest version has decimal (e.g., v2.1), suggest remaining decimals
      if (minorVersion < 9) {
        for (let i = minorVersion + 1; i <= 9; i++) {
          suggestions.push(`v${majorVersion}.${i}`);
        }
      }
      // Always suggest next major version
      suggestions.push(`v${majorVersion + 1}`);
    }
    
    // Remove duplicates and return unique versions
    return [...new Set(suggestions)];
  };

  const getNextVersion = (platform) => {
    const nextVersions = getNextVersions(platform);
    return nextVersions[0]; // Return the first (most logical) next version
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    
    if (platform) {
      // Automatically set the next suggested version
      const nextVersion = getNextVersion(platform);
      setSelectedVersion(nextVersion);
      
      const nextVersions = getNextVersions(platform);
      setFilteredVersions(nextVersions);
      setShowVersionSuggestions(true);
    } else {
      setSelectedVersion('');
      setFilteredVersions([]);
      setShowVersionSuggestions(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (!selectedPlatform || !selectedVersion || !selectedFile) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setShowConfirmation(true);
  };

  const handleVersionChange = (e) => {
    const value = e.target.value;
    setSelectedVersion(value);
    
    if (value.trim() === '') {
      if (selectedPlatform) {
        const nextVersions = getNextVersions(selectedPlatform);
        setFilteredVersions(nextVersions);
        setShowVersionSuggestions(true);
      } else {
        setFilteredVersions([]);
        setShowVersionSuggestions(false);
      }
      return;
    }
    
    // Filter from the suggested versions for the selected platform
    const platformVersions = getNextVersions(selectedPlatform);
    const filtered = platformVersions.filter(version => 
      version.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredVersions(filtered);
    setShowVersionSuggestions(filtered.length > 0);
  };

  const selectVersion = (version) => {
    setSelectedVersion(version);
    setShowVersionSuggestions(false);
  };

  const confirmAdd = async () => {

    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const appName = `ERS-${selectedPlatform}-${selectedVersion}`;
      const fileExt = selectedFile.name.split('.').pop();
      const newFileName = `${appName}.${fileExt}`;
      const storageRef = ref(
        storage,
        `installer-versions/${selectedPlatform.toLowerCase()}/${newFileName}`
      );
      const renamedFile = new File([selectedFile], newFileName, { type: selectedFile.type });
      await uploadBytes(storageRef, renamedFile);
      const fileUrl = await getDownloadURL(storageRef);

      onAdd({
        name: appName,
        platform: selectedPlatform,
        version: selectedVersion,
        lastUpdate: getTodayDate(),
        fileName: newFileName,
        fileSize: selectedFile.size,
        fileUrl: fileUrl
      });

      setSelectedPlatform('');
      setSelectedVersion('');
      setSelectedFile(null);
      setShowConfirmation(false);
      setError('');
      setIsLoading(false);
      onClose();
    } catch (err) {
      setError('Failed to upload. Please try again.');
      setShowConfirmation(false);
      console.error(err);
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "installers"));
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setTableData(data);
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      }
    };

    fetchData();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-lg p-6 w-96 max-w-md shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">Add New Application</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Platform Dropdown */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Platform <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => handlePlatformChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="" className="text-black">Select Platform</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform} className="text-black">
                  {platform}
                </option>
              ))}
            </select>
          </div>

          {/* Version Input with Suggestions */}
          <div className="relative">
            <label className="block text-sm font-medium text-black mb-2">
              Version <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={selectedVersion}
              onChange={handleVersionChange}
              onFocus={() => {
                if (selectedPlatform) {
                  const nextVersions = getNextVersions(selectedPlatform);
                  setFilteredVersions(nextVersions);
                  setShowVersionSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow clicking on them
                setTimeout(() => setShowVersionSuggestions(false), 200);
              }}
              placeholder={selectedPlatform ? `Type version for ${selectedPlatform}` : "Select platform first"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
            
            {/* Version Suggestions Dropdown */}
            {showVersionSuggestions && selectedPlatform && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredVersions.map((version, index) => (
                  <div
                    key={`${selectedPlatform}-${version}-${index}`}
                    onClick={() => selectVersion(version)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-black border-b border-gray-100 last:border-b-0"
                  >
                    {version}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Upload Application File <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors duration-200">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".exe,.dmg,.deb,.rpm,.app,.apk,.ipa"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {selectedFile ? (
                  <div className="text-black">
                    <div className="font-medium">✓ File Selected</div>
                    <div className="text-sm text-gray-600 mt-1">{selectedFile.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <div className="text-lg mb-2">📁</div>
                    <div className="font-medium">Click to upload file</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Supports: .exe, .dmg, .deb, .rpm, .app, .apk, .ipa
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Date Display */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Last Update
            </label>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-black">
              {getTodayDate()}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedPlatform || !selectedVersion || !selectedFile}
            className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${
              selectedPlatform && selectedVersion && selectedFile
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Add Application
          </button>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-80 max-w-sm shadow-2xl border border-gray-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🤔</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Application</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to add this application?
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <div className="grid grid-cols-2 gap-2 text-left">
                  <span className="font-medium text-gray-700">Platform:</span>
                  <span className="text-gray-900">{selectedPlatform}</span>
                  <span className="font-medium text-gray-700">Version:</span>
                  <span className="text-gray-900">{selectedVersion}</span>
                  <span className="font-medium text-gray-700">File:</span>
                  <span className="text-gray-900">{selectedFile ? selectedFile.name : 'No file selected'}</span>
                  <span className="font-medium text-gray-700">Date:</span>
                  <span className="text-gray-900">{getTodayDate()}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelConfirmation}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAdd}
                  disabled={isLoading}
                  className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Adding...
                    </span>
                  ) : (
                    'Confirm Add'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddModal;