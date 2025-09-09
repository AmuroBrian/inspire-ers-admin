'use client';

import React, { useState, useEffect } from 'react';
import AddModal from './add';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { storage } from '@/firebase/firebaseConfig';
import { ref, deleteObject } from 'firebase/storage';

const Hero = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, item: null });
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  const fetchInstallers = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'installers'));
      const fetchedData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTableData(fetchedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstallers();
  }, []);

  const filteredData = activeFilter === 'all'
    ? tableData
    : tableData.filter(item => item.platform === activeFilter);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, tableData]);

  const handleAddApplication = async () => {
    await fetchInstallers();
    setIsAddModalOpen(false);
  };

  const handleDeleteApplication = (item) => {
    setDeleteConfirmation({ show: true, item });
  };

const confirmDelete = async () => {
  const { item } = deleteConfirmation;
  try {
    if (item.fileName && item.platform) {
      const fileRef = ref(
        storage,
        `installer-versions/${item.platform.toLowerCase()}/${item.fileName}`
      );
      await deleteObject(fileRef);
    }

    await deleteDoc(doc(db, 'installers', item.id));

    fetchInstallers();
    setDeleteConfirmation({ show: false, item: null });
  } catch (error) {
    console.error('Error deleting application:', error);
    setDeleteConfirmation({ show: false, item: null });
  }
};

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, item: null });
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <div className="ml-4 text-gray-700 font-semibold">Loading applications...</div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 py-32 px-4 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto text-center w-full">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-8">
            Welcome to ERS Admin
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
          {/* Your other components */}
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
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 w-full">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wider border-b border-blue-500 w-40">ID</th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white uppercase tracking-wider border-b border-blue-500 min-w-40">Application Name</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider border-b border-blue-500 w-28">Platform</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider border-b border-blue-500 w-20">Version</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider border-b border-blue-500 w-28">Last Update</th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-white uppercase tracking-wider border-b border-blue-500 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentData.map((item, index) => (
                  <tr key={item.id} className={`hover:bg-blue-50 transition-colors duration-300 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-36 h-8 bg-gray-100 text-gray-800 text-xs font-bold rounded-full">
                        {item.id}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                        <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-4 py-2 text-xs font-bold rounded-full shadow-sm ${
                        item.platform === 'Windows' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        item.platform === 'macOS' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                        'bg-orange-100 text-orange-800 border border-orange-200'
                      }`}>
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg border border-gray-200">
                        {item.version}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-600 font-medium">
                        {item.lastUpdate}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDeleteApplication(item)}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                        title="Delete"
                      >
                        🗑️ Delete
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
        <div className="mt-8 flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{filteredData.length}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
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
                Are you sure you want to delete &quot;{deleteConfirmation.item?.name}&quot;? This action cannot be undone.
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