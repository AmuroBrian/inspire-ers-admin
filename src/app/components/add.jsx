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
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const platforms = ['Windows', 'macOS', 'Linux'];
  const versions = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9'];

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  const confirmAdd = async () => {
    setError('');
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
              onChange={(e) => setSelectedPlatform(e.target.value)}
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

          {/* Version Dropdown */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Version <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="" className="text-black">Select Version</option>
              {versions.map((version) => (
                <option key={version} value={version} className="text-black">
                  {version}
                </option>
              ))}
            </select>
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
                  className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Confirm Add
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