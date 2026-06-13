'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { sellerService } from '../../services/seller.service';
import type { CreateApplicationRequest, PersonType } from '../../services/seller.service';

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  description: string;
  person_type: string;
  inn: string;
  ogrn: string;
  address: string;
  bic: string;
  checking_account: string;
  agreedToTerms: boolean;
}

interface FieldErrors {
  full_name?: string;
  email?: string;
  phone?: string;
  inn?: string;
  ogrn?: string;
  bic?: string;
  checking_account?: string;
}

const STEPS = [
  { id: 1, title: 'Данные продавца', subtitle: 'Личная информация' },
  { id: 2, title: 'Юридические данные', subtitle: 'Реквизиты компании' },
  { id: 3, title: 'Подтверждение', subtitle: 'Проверка данных' },
];

const validateField = (field: string, value: string): string | undefined => {
  switch (field) {
    case 'full_name':
      if (!value.trim()) return 'Введите имя';
      if (value.trim().length < 2) return 'Минимум 2 символа';
      if (value.trim().length > 100) return 'Максимум 100 символов';
      break;
    case 'email':
      if (!value.trim()) return 'Введите email';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Некорректный email';
      break;
    case 'phone':
      if (!value.trim()) return 'Введите телефон';
      const phoneDigits = value.replace(/\D/g, '');
      if (phoneDigits.length < 10) return 'Минимум 10 цифр';
      if (phoneDigits.length > 15) return 'Максимум 15 цифр';
      break;
    case 'ogrn':
      if (!value.trim()) return 'Введите ОГРН/ОГРНИП';
      if (!/^\d+$/.test(value.trim())) return 'Только цифры';
      if (value.trim().length !== 13 && value.trim().length !== 15) return 'ОГРН — 13 цифр, ОГРНИП — 15 цифр';
      break;
    case 'bic':
      if (value.trim() && !/^\d{9}$/.test(value.trim())) return 'БИК — ровно 9 цифр';
      break;
    case 'checking_account':
      if (value.trim() && !/^\d{20}$/.test(value.trim())) return 'Расчётный счёт — ровно 20 цифр';
      break;
  }
  return undefined;
};

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function SellerApplicationForm({ storageKey }: { storageKey?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const getDefaultForm = (): FormData => ({
    full_name: '',
    email: '',
    phone: '',
    description: '',
    person_type: 'INDIVIDUAL_EMPLOYER',
    inn: '',
    ogrn: '',
    address: '',
    bic: '',
    checking_account: '',
    agreedToTerms: false,
  });

  const loadSavedForm = (): FormData => {
    if (!storageKey) return getDefaultForm();
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as FormData;
        return { ...getDefaultForm(), ...parsed };
      }
    } catch { /* ignore */ }
    return getDefaultForm();
  };

  const [form, setForm] = useState<FormData>(loadSavedForm);

  const update = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value as string);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field as keyof FormData] as string);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const getFieldError = (field: keyof FieldErrors) => touched[field] ? errors[field] : undefined;

  const validateStep = (stepNum: number): boolean => {
    const newErrors: FieldErrors = {};
    let isValid = true;
    const fieldsToValidate: (keyof FieldErrors)[] = [];
    if (stepNum === 1) fieldsToValidate.push('full_name', 'email', 'phone');
    if (stepNum === 2) fieldsToValidate.push('inn', 'ogrn', 'bic', 'checking_account');

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, form[field as keyof FormData] as string);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
      setTouched((prev) => ({ ...prev, [field]: true }));
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return form.full_name.trim() && form.email.trim() && form.phone.trim() &&
          !validateField('full_name', form.full_name) && !validateField('email', form.email) && !validateField('phone', form.phone);
      case 2:
        return form.person_type && form.inn.trim() && form.ogrn.trim() &&
          !validateField('inn', form.inn) && !validateField('ogrn', form.ogrn) &&
          !validateField('bic', form.bic) && !validateField('checking_account', form.checking_account);
      case 3:
        return form.agreedToTerms;
      default:
        return false;
    }
  };

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(form));
    }
  }, [form, storageKey]);

  const clearSavedForm = () => {
    if (storageKey) localStorage.removeItem(storageKey);
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    if (!step1Valid || !step2Valid || !form.agreedToTerms) return;

    setIsSubmitting(true);
    try {
      const data: CreateApplicationRequest = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        description: form.description,
        person_type: form.person_type as PersonType,
        inn: form.inn,
        ogrn: form.ogrn,
        address: form.address,
        bic: form.bic,
        checking_account: form.checking_account,
      };
      const result = await sellerService.createApplication(data);
      clearSavedForm();
      if (result?.id) {
        const userStr = localStorage.getItem('auth_user');
        let userId = 1;
        if (userStr) {
          try { userId = JSON.parse(userStr).id || 1; } catch { /* ignore */ }
        }
        localStorage.setItem(`seller_app_${userId}`, JSON.stringify(result));
      }
      router.push('/profile');
    } catch { /* ignore */ }
    setIsSubmitting(false);
  };

  return (
		<div>
			{/* Stepper */}
			<div className='flex items-center gap-2 mb-8'>
				{STEPS.map((s, i) => (
					<div key={s.id} className='flex items-center gap-2 flex-1'>
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'}`}
						>
							{step > s.id ? <Check className='h-4 w-4' /> : s.id}
						</div>
						<div className='hidden sm:block'>
							<p
								className={`text-sm font-medium ${step === s.id ? 'text-gray-900' : 'text-gray-500'}`}
							>
								{s.title}
							</p>
							<p className='text-xs text-gray-400'>{s.subtitle}</p>
						</div>
						{i < STEPS.length - 1 && (
							<div
								className={`flex-1 h-0.5 ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`}
							/>
						)}
					</div>
				))}
			</div>

			{/* Step content */}
			<div className='bg-white rounded-xl border border-gray-200 p-6'>
				{step === 1 && (
					<div className='space-y-4'>
						<h3 className='text-lg font-semibold text-gray-900 mb-4'>
							Данные продавца
						</h3>
						<FormField label='Имя' required error={getFieldError('full_name')}>
							<Input
								value={form.full_name}
								onChange={e => update('full_name', e.target.value)}
								onBlur={() => handleBlur('full_name')}
								placeholder='Иванов Иван Иванович'
							/>
						</FormField>
						<FormField label='Email' required error={getFieldError('email')}>
							<Input
								type='email'
								value={form.email}
								onChange={e => update('email', e.target.value)}
								onBlur={() => handleBlur('email')}
								placeholder='ivanov@example.com'
							/>
						</FormField>
						<FormField label='Телефон' required error={getFieldError('phone')}>
							<Input
								type='tel'
								value={form.phone}
								onChange={e => update('phone', e.target.value)}
								onBlur={() => handleBlur('phone')}
								placeholder='+7 (999) 123-45-67'
							/>
						</FormField>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								О себе
							</label>
							<Textarea
								value={form.description}
								onChange={e => update('description', e.target.value)}
								placeholder='Расскажите о себе и опыте...'
								rows={3}
							/>
						</div>
					</div>
				)}

				{step === 2 && (
					<div className='space-y-4'>
						<h3 className='text-lg font-semibold text-gray-900 mb-4'>
							Юридические данные
						</h3>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Тип лица *
							</label>
							<div className='flex gap-3'>
								{([
										{ value: 'INDIVIDUAL_EMPLOYER', label: 'ИП' },
										{ value: 'SELF_EMPLOYED', label: 'Самозанятый' },
										{ value: 'OOO', label: 'ООО' },
									] as const).map(({ value, label }) => (
									<label
										key={value}
										className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${form.person_type === value ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 hover:border-gray-300'}`}
									>
										<input
											type='radio'
											name='person_type'
											value={value}
											checked={form.person_type === value}
											onChange={() => update('person_type', value)}
											className='sr-only'
										/>
										<span className='text-sm font-medium'>{label}</span>
									</label>
								))}
							</div>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<FormField label='ИНН' required error={getFieldError('inn')}>
								<Input
									value={form.inn}
									onChange={e => update('inn', e.target.value)}
									onBlur={() => handleBlur('inn')}
									placeholder='771234567890'
								/>
							</FormField>
							<FormField
								label='ОГРН/ОГРНИП'
								required
								error={getFieldError('ogrn')}
							>
								<Input
									value={form.ogrn}
									onChange={e => update('ogrn', e.target.value)}
									onBlur={() => handleBlur('ogrn')}
									placeholder='321774600000000'
								/>
							</FormField>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Юридический адрес
							</label>
							<Textarea
								value={form.address}
								onChange={e => update('address', e.target.value)}
								placeholder='г. Москва, ул. Тверская, д. 1'
								rows={2}
							/>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<FormField label='БИК' error={getFieldError('bic')}>
								<Input
									value={form.bic}
									onChange={e => update('bic', e.target.value)}
									onBlur={() => handleBlur('bankBik')}
									placeholder='044525225'
								/>
							</FormField>
							<FormField
								label='Расчётный счёт'
								error={getFieldError('checking_account')}
							>
								<Input
									value={form.checking_account}
									onChange={e => update('checking_account', e.target.value)}
									onBlur={() => handleBlur('bankAccount')}
									placeholder='40702810100000000001'
								/>
							</FormField>
						</div>
					</div>
				)}

				{step === 3 && (
					<div className='space-y-4'>
						<h3 className='text-lg font-semibold text-gray-900 mb-4'>
							Подтверждение
						</h3>
						<div className='bg-gray-50 rounded-lg p-4 space-y-3 text-sm'>
							<div>
								<p className='text-gray-500 font-medium'>Продавец</p>
								<p className='text-gray-900'>{form.full_name}</p>
								<p className='text-gray-500'>
									{form.email} • {form.phone}
								</p>
								{form.description && (
									<p className='text-gray-400 mt-1'>{form.description}</p>
								)}
							</div>
							<div className='border-t border-gray-200 pt-3'>
								<p className='text-gray-500 font-medium'>Юридические данные</p>
								<p className='text-gray-900'>
									{form.person_type} • ИНН: {form.inn}
								</p>
								<p className='text-gray-500'>ОГРН: {form.ogrn}</p>
								{form.address && (
									<p className='text-gray-400'>{form.address}</p>
								)}
							</div>
							<div className='border-t border-gray-200 pt-3 bg-blue-50 -mx-4 px-4 py-3 rounded-b-lg'>
								<p className='text-blue-700 text-xs'>
									💡 После одобрения заявки вы сможете создать до 10 магазинов и
									добавить товары в личном кабинете продавца.
								</p>
							</div>
						</div>
						<label className='flex items-start gap-3 cursor-pointer'>
							<input
								type='checkbox'
								checked={form.agreedToTerms}
								onChange={e => update('agreedToTerms', e.target.checked)}
								className='mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
							/>
							<span className='text-sm text-gray-600'>
								Я согласен с условиями использования платформы и подтверждаю
								достоверность предоставленных данных
							</span>
						</label>
					</div>
				)}

				{/* Navigation */}
				<div className='flex items-center justify-between mt-6 pt-4 border-t border-gray-200'>
					{step > 1 ? (
						<Button
							variant='secondary'
							onClick={() => setStep(s => s - 1)}
							className='flex items-center gap-1'
						>
							<ChevronLeft className='h-4 w-4' />
							<span>Назад</span>
						</Button>
					) : (
						<div />
					)}
					{step < 3 ? (
						<Button
							variant='primary'
							onClick={handleNext}
							disabled={!canProceed()}
							className='flex items-center gap-1'
						>
							<span>Далее</span>
							<ChevronRight className='h-4 w-4' />
						</Button>
					) : (
						<Button
							variant='primary'
							onClick={handleSubmit}
							disabled={!canProceed() || isSubmitting}
						>
							{isSubmitting ? 'Отправка...' : 'Отправить заявку'}
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
