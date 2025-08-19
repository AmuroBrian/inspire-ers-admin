'use client';

import React, { useState, useEffect } from 'react';
import AddModal from './add';

const Hero = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, id: null, name: '' });
  const itemsPerPage = 10;
  
  // Default data - same for server and client
  const defaultData = [
    { id: 1, name: 'ERS Alorica', platform: 'Windows', version: '2.1.0', status: 'Active', lastUpdate: '2024-12-19' },
    { id: 2, name: 'ERS Alorica macOS', platform: 'macOS', version: '1.8.2', status: 'Active', lastUpdate: '2024-12-19' },
    { id: 3, name: 'ERS Concentrix Linux', platform: 'Linux', version: '3.0.1', status: 'Active', lastUpdate: '2024-12-19' },
    { id: 4, name: 'ERS Concentrix', platform: 'Windows', version: '2.0.5', status: 'Inactive', lastUpdate: '2024-12-19' },
    { id: 5, name: 'ERS Concentrix macOS', platform: 'macOS', version: '1.9.0', status: 'Active', lastUpdate: '2024-12-19' },
    { id: 6, name: 'ERS Teleperformance Linux', platform: 'Linux', version: '2.9.8', status: 'Active', lastUpdate: '2024-12-19' },
    { id: 7, name: 'ERS Teleperformance', platform: 'Windows', version: '2.2.0', status: 'Active', lastUpdate: '2024-12-19' },
    { id: 8, name: 'ERS Teleperformance macOS', platform: 'macOS', version: '1.7.5', status: 'Inactive', lastUpdate: '2024-12-19' },
    { id: 9, name: 'ERS Alorica Linux', platform: 'Linux', version: '3.1.2', status: 'Active', lastUpdate: '2024-12-19' },
  ];

  const [tableData, setTableData] = useState(defaultData);

  // Load data from localStorage after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('ersTableData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setTableData(parsedData);
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
          setTableData(defaultData);
        }
      }
    }
  }, []);

  const filteredData = activeFilter === 'all' 
    ? tableData 
    : tableData.filter(item => item.platform === activeFilter);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to save data to localStorage
  const saveToLocalStorage = (data) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ersTableData', JSON.stringify(data));
    }
  };

  // Function to handle upload and update last update date
  const handleUpload = (id) => {
    const updatedData = tableData.map(item => 
      item.id === id 
        ? { ...item, lastUpdate: getTodayDate() }
        : item
    );
    setTableData(updatedData);
    saveToLocalStorage(updatedData);
  };

  // Function to handle adding new application
  const handleAddApplication = (newApp) => {
    const newId = Math.max(...tableData.map(item => item.id)) + 1;
    const newApplication = {
      id: newId,
      name: `ERS ${newApp.platform} ${newApp.version}`,
      platform: newApp.platform,
      version: newApp.version,
      lastUpdate: newApp.lastUpdate
    };
    const updatedData = [newApplication, ...tableData];
    setTableData(updatedData);
    saveToLocalStorage(updatedData);
    setCurrentPage(1); // Reset to first page after adding
  };

  // Function to handle deleting an application
  const handleDeleteApplication = (id, name) => {
    setDeleteConfirmation({ show: true, id, name });
  };

  const confirmDelete = () => {
    const updatedData = tableData.filter(item => item.id !== deleteConfirmation.id);
    setTableData(updatedData);
    saveToLocalStorage(updatedData);
    
    // Adjust current page if needed
    const newTotalPages = Math.ceil(updatedData.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
    
    setDeleteConfirmation({ show: false, id: null, name: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, id: null, name: '' });
  };

  // Pagination navigation functions
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-32 px-4 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto text-center w-full">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-8">
            Welcome to ERS Admin
          </h1>
         
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
 
        </div>

        {/* Platform Filter Buttons */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Application Management</h2>
          <div className="flex flex-wrap gap-4 mb-6">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeFilter === 'all' 
                  ? 'bg-gray-700 text-white shadow-lg' 
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-500'
              }`}
            >
              All Platforms
            </button>
            <button 
              onClick={() => setActiveFilter('Windows')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeFilter === 'Windows' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-blue-600 border-2 border-blue-300 hover:border-blue-500'
              }`}
            >
              Windows
            </button>
            <button 
              onClick={() => setActiveFilter('macOS')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeFilter === 'macOS' 
                  ? 'bg-gray-800 text-white shadow-lg' 
                  : 'bg-white text-gray-800 border-2 border-gray-400 hover:border-gray-600'
              }`}
            >
              macOS
            </button>
            <button 
              onClick={() => setActiveFilter('Linux')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeFilter === 'Linux' 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'bg-white text-orange-600 border-2 border-orange-300 hover:border-orange-500'
              }`}
            >
              Linux
            </button>
          </div>

          {/* Add New Application Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              + Add New Application
            </button>
          </div>
        </div>

        {/* Large Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Application Name</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Last Update</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-left">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        item.platform === 'Windows' ? 'bg-blue-100 text-blue-800' :
                        item.platform === 'macOS' ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.version}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.lastUpdate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDeleteApplication(item.id, item.name)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1 px-2 rounded transition-colors duration-200"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{filteredData.length}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {filteredData.length}
            </div>
            <div className="text-sm text-gray-600">Applications</div>
          </div>
        </div>

        {/* Add Modal */}
        <AddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddApplication}
        />

        {/* Delete Confirmation Modal */}
        {deleteConfirmation.show && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-lg p-6 w-80 max-w-sm shadow-2xl border border-white/20">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "{deleteConfirmation.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero; 