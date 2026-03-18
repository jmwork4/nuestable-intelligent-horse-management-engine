import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '@/api/auth';
import { Button, Input } from '@/components/ui';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => navigate(from, { replace: true }),
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Nuestable</h1>
          <p className="text-xl text-brand-200 leading-relaxed">
            The intelligent engine behind every winning stable
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gold-400">100%</p>
              <p className="text-sm text-brand-200 mt-1">Compliance</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gold-400">24/7</p>
              <p className="text-sm text-brand-200 mt-1">Monitoring</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gold-400">Real-time</p>
              <p className="text-sm text-brand-200 mt-1">Insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-brand-600">Nuestable</h1>
            <p className="text-sm text-gray-500 mt-1">The intelligent engine behind every winning stable</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Sign in to your account</p>

          {loginMutation.isError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Invalid email or password. Please try again.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@yourfarm.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                <span className="text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <button type="button" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" loading={loginMutation.isPending} size="lg">
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
              Get started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
