'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectSchema, SubjectFormValues } from "@/prisma/schema";
import { Toaster, toast } from 'sonner';


interface Subject {
  id: string;
  name: string;
  description?: string;
}

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: '', description: '' },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subjects');
      if (!res.ok) throw new Error('Failed to fetch subjects');
      const data: Subject[] = await res.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (subject: Subject | null = null) => {
    setCurrentSubject(subject);
    if (subject) {
      form.reset({ name: subject.name, description: subject.description });
    } else {
      form.reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSubject(null);
  };

  const onSubmit = async (data: SubjectFormValues) => {
    const toastId = toast.loading('Saving subject...');
    try {
      const isEditing = !!currentSubject;
      const url = isEditing ? `/api/subjects/${currentSubject?.id}` : '/api/subjects';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to save subject');

      await fetchData();
      handleCloseModal();
      toast.success('Subject saved successfully!', { id: toastId });
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Failed to save subject. Please try again.', { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this subject?");
    if (!confirmed) return;

    const toastId = toast.loading('Deleting subject...');
    try {
      const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete subject');

      await fetchData();
      toast.success('Subject deleted successfully!', { id: toastId });
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject. Please try again.', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Subjects</h1>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Add Subject
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No subjects found.</td>
                </tr>
              ) : (
                subjects.map(subject => (
                  <tr key={subject.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => handleOpenModal(subject)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                      <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">{currentSubject ? 'Edit Subject' : 'Add Subject'}</h2>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium">Subject Name</label>
                  <input id="name" {...form.register('name')} className="w-full border rounded-md px-3 py-2 mt-1" />
                  {form.formState.errors.name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>}
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium">Description</label>
                  <textarea id="description" {...form.register('description')} className="w-full border rounded-md px-3 py-2 mt-1" />
                  {form.formState.errors.description && <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>}
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded-md">Cancel</button>
                  <button type="submit" disabled={form.formState.isSubmitting} className="px-4 py-2 bg-blue-500 text-white rounded-md">
                    {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectsPage;