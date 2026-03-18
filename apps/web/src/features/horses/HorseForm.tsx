import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, Button, Input, Select, Card } from '@/components/ui';
import { useHorse, useCreateHorse, useUpdateHorse } from '@/api/horses';
import { HorseSex, HorseBreed, HorseStatus, Surface } from '@nuestable/shared';
import { useAuthStore } from '@/stores/auth';
import { toast } from '@/components/ui/Toast';

const horseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  registeredName: z.string().optional(),
  tattooNumber: z.string().optional(),
  chipNumber: z.string().optional(),
  foalDate: z.string().optional(),
  sex: z.nativeEnum(HorseSex),
  breed: z.nativeEnum(HorseBreed),
  color: z.string().optional(),
  status: z.nativeEnum(HorseStatus).optional(),
  sire: z.string().optional(),
  dam: z.string().optional(),
  notes: z.string().optional(),
  claimPrice: z.string().optional(),
});

type HorseFormData = z.infer<typeof horseSchema>;

export default function HorseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: existingHorse } = useHorse(id);
  const createMutation = useCreateHorse();
  const updateMutation = useUpdateHorse();

  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HorseFormData>({
    resolver: zodResolver(horseSchema),
    values: existingHorse
      ? {
          name: existingHorse.name,
          registeredName: existingHorse.registeredName ?? '',
          tattooNumber: existingHorse.tattooNumber ?? '',
          chipNumber: existingHorse.chipNumber ?? '',
          foalDate: existingHorse.foalDate
            ? new Date(existingHorse.foalDate).toISOString().split('T')[0]
            : '',
          sex: existingHorse.sex,
          breed: existingHorse.breed,
          color: existingHorse.color ?? '',
          status: existingHorse.status,
          sire: existingHorse.pedigree?.sire ?? '',
          dam: existingHorse.pedigree?.dam ?? '',
          notes: existingHorse.notes ?? '',
          claimPrice: existingHorse.claimPrice ? String(existingHorse.claimPrice / 100) : '',
        }
      : undefined,
  });

  const onSubmit = (data: HorseFormData) => {
    const payload = {
      name: data.name,
      registeredName: data.registeredName || undefined,
      tattooNumber: data.tattooNumber || undefined,
      chipNumber: data.chipNumber || undefined,
      foalDate: data.foalDate || undefined,
      sex: data.sex,
      breed: data.breed,
      color: data.color || undefined,
      status: data.status,
      pedigree: data.sire || data.dam ? { sire: data.sire || null, dam: data.dam || null, sireOfDam: null } : undefined,
      notes: data.notes || undefined,
      claimPrice: data.claimPrice ? Math.round(parseFloat(data.claimPrice) * 100) : undefined,
    };

    if (isEditing && id) {
      updateMutation.mutate(
        { id, ...payload },
        {
          onSuccess: () => {
            toast.success('Horse updated');
            navigate(`/horses/${id}`);
          },
          onError: () => toast.error('Failed to update horse'),
        },
      );
    } else {
      createMutation.mutate(
        { ...payload, organizationId: user?.organizationId ?? '' },
        {
          onSuccess: (horse) => {
            toast.success('Horse created');
            navigate(`/horses/${horse.id}`);
          },
          onError: () => toast.error('Failed to create horse'),
        },
      );
    }
  };

  const sexOptions = Object.values(HorseSex).map((s) => ({ label: s, value: s }));
  const breedOptions = Object.values(HorseBreed).map((b) => ({ label: b.replace(/_/g, ' '), value: b }));
  const statusOptions = Object.values(HorseStatus).map((s) => ({ label: s, value: s }));

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Edit Horse' : 'Add Horse'}
        breadcrumbs={[
          { label: 'Horses', href: '/horses' },
          { label: isEditing ? existingHorse?.name ?? 'Edit' : 'New Horse' },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <Input label="Registered Name" {...register('registeredName')} />
            <Select label="Sex" options={sexOptions} error={errors.sex?.message} {...register('sex')} />
            <Select label="Breed" options={breedOptions} error={errors.breed?.message} {...register('breed')} />
            <Input label="Color" placeholder="Bay, Chestnut, etc." {...register('color')} />
            <Input label="Foal Date" type="date" {...register('foalDate')} />
            {isEditing && (
              <Select label="Status" options={statusOptions} {...register('status')} />
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Identification</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Tattoo Number" {...register('tattooNumber')} />
            <Input label="Chip Number" {...register('chipNumber')} />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Pedigree</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Sire" placeholder="Sire name" {...register('sire')} />
            <Input label="Dam" placeholder="Dam name" {...register('dam')} />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Additional Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Claim Price ($)" type="number" step="0.01" {...register('claimPrice')} />
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <textarea
                {...register('notes')}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? 'Save Changes' : 'Create Horse'}
          </Button>
        </div>
      </form>
    </div>
  );
}
