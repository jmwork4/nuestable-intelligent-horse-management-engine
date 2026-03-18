import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PageHeader, Card, CardTitle, Button, Input, Select, Badge, LoadingSpinner } from '@/components/ui';
import { useUploadFile, useUploadDocument } from '@/api/documents';
import { useHorses } from '@/api/horses';
import { useAuthStore } from '@/stores/auth';
import { toast } from '@/components/ui/Toast';
import { DocumentCategory, ExtractionConfidence } from '@nuestable/shared';
import { CloudArrowUpIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export default function UploadPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; fileType: string; fileSizeBytes: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: horsesData } = useHorses({ limit: 100 });
  const uploadFileMutation = useUploadFile();
  const uploadDocMutation = useUploadDocument();

  const horses = horsesData?.data ?? [];

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      category: DocumentCategory.OTHER as string,
      horseId: '',
      expiresAt: '',
      description: '',
    },
  });

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0]!;
    setSelectedFile(file);

    uploadFileMutation.mutate(file, {
      onSuccess: (result) => {
        setUploadedFile(result);
        toast.success('File uploaded, processing...');
      },
      onError: () => toast.error('Failed to upload file'),
    });
  }, [uploadFileMutation]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const onSubmit = (data: Record<string, string>) => {
    if (!uploadedFile) {
      toast.error('Please upload a file first');
      return;
    }

    uploadDocMutation.mutate(
      {
        organizationId: user?.organizationId ?? '',
        title: data.title ?? '',
        category: data.category as DocumentCategory,
        horseId: data.horseId || undefined,
        expiresAt: data.expiresAt || undefined,
        description: data.description || undefined,
        fileUrl: uploadedFile.url,
        fileType: uploadedFile.fileType,
        fileSizeBytes: uploadedFile.fileSizeBytes,
      },
      {
        onSuccess: () => {
          toast.success('Document saved');
          navigate('/documents');
        },
        onError: () => toast.error('Failed to save document'),
      },
    );
  };

  const categoryOptions = Object.values(DocumentCategory).map((c) => ({ label: c.replace(/_/g, ' '), value: c }));
  const horseOptions = [
    { label: 'None (General)', value: '' },
    ...horses.map((h) => ({ label: h.name, value: h.id })),
  ];

  return (
    <div>
      <PageHeader
        title="Upload Document"
        breadcrumbs={[
          { label: 'Documents', href: '/documents' },
          { label: 'Upload' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upload area */}
        <div className="space-y-6">
          <Card>
            <CardTitle className="mb-4">File Upload</CardTitle>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
                dragOver
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-700',
              )}
            >
              {uploadFileMutation.isPending ? (
                <LoadingSpinner size="lg" />
              ) : (
                <>
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Drag and drop your file here, or{' '}
                    <label className="cursor-pointer text-brand-600 hover:text-brand-700">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => handleFiles(e.target.files)}
                      />
                    </label>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">PDF, JPG, PNG, DOC up to 10MB</p>
                </>
              )}
            </div>

            {selectedFile && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <DocumentMagnifyingGlassIcon className="h-8 w-8 text-brand-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {uploadedFile && <Badge color="green" size="sm">Uploaded</Badge>}
              </div>
            )}
          </Card>

          {/* AI Extraction Preview */}
          {uploadedFile && (
            <Card>
              <CardTitle className="mb-4">AI Extraction Preview</CardTitle>
              <p className="text-sm text-gray-500 mb-4">
                Our AI has analyzed the document and extracted the following fields. Review and confirm.
              </p>
              <div className="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Document Type</span>
                  <Badge color="green" size="sm">HIGH</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Date Detected</span>
                  <Badge color="green" size="sm">HIGH</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-2 italic">
                  Extraction details will appear here once the backend processes the document.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Document details form */}
        <Card>
          <CardTitle className="mb-4">Document Details</CardTitle>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Title" placeholder="e.g. Coggins Test 2026" {...register('title', { required: 'Title is required' })} error={errors.title?.message} />
            <Select label="Category" options={categoryOptions} {...register('category')} />
            <Select label="Horse" options={horseOptions} {...register('horseId')} />
            <Input label="Expiry Date" type="date" {...register('expiresAt')} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Optional description"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" type="button" onClick={() => navigate('/documents')}>Cancel</Button>
              <Button type="submit" loading={uploadDocMutation.isPending} disabled={!uploadedFile}>
                Save Document
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
