import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { CalculationParams } from '../types';
import { AppState } from '../store/store';

import {
  TextInput,
  NumberInput,
  DateInput,
  DynamicFieldArray,
  SelectInput,
} from './form/components';
import Spinner from './spinner/Spinner';

interface ParametersFormProps {
  onCalculate: (params: CalculationParams) => void;
}

const ParametersForm: React.FC<ParametersFormProps> = ({ onCalculate }) => {
  const loading = useSelector((state: AppState) => state.wibor.loading);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, setValue } = useForm<CalculationParams>({
    defaultValues: {
      borrower: 'JAN KOWALSKI',
      loanAmount: 180000,
      loanTerms: 300,
      margin: 1.99,
      startDate: new Date('2011-08-19'),
      firstInstallmentDate: new Date('2011-09-07'),
      gracePeriodMonths: 0,
      holidayMonths: [],
      prepayments: [],
      disbursements: [],
      installmentType: 'malejące',
      wiborRate: 4.3,
    },
  });

  const formData = useWatch({ control });

  useEffect(() => {
    const savedData = localStorage.getItem('calculationParams');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach((key) => {
        setValue(key as keyof CalculationParams, parsedData[key]);
      });
    }
  }, [setValue]);

  useEffect(() => {
    localStorage.setItem('calculationParams', JSON.stringify(formData));
  }, [formData]);

  const onSubmit = async (data: CalculationParams) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      data.margin = Number(data.margin);
      await onCalculate(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-gray-100 p-6 rounded-lg shadow-md mb-4"
    >
      <h2 className="text-xl font-bold mb-4">Wprowadź parametry kredytu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          label="Kredytobiorca"
          control={control}
          name="borrower"
          rules={{ required: 'Kredytobiorca jest wymagany' }}
        />
        <NumberInput
          label="Kwota kredytu (zł)"
          control={control}
          name="loanAmount"
          rules={{
            required: 'Kwota kredytu jest wymagana',
            min: { value: 1, message: 'Kwota musi być większa niż 0' },
          }}
        />
        <NumberInput
          label="Ilość rat"
          control={control}
          name="loanTerms"
          rules={{
            required: 'Ilość rat jest wymagana',
            min: { value: 1, message: 'Ilość rat musi być większa niż 0' },
          }}
        />
        <DateInput
          label="Data podpisania"
          control={control}
          name="startDate"
          rules={{ required: 'Data podpisania jest wymagana' }}
        />
        <DateInput
          label="Data pierwszej raty"
          control={control}
          name="firstInstallmentDate"
          rules={{ required: 'Data pierwszej raty jest wymagana' }}
        />
        <NumberInput
          label="Marża (%)"
          control={control}
          name="margin"
          rules={{
            required: 'Marża jest wymagana',
            min: { value: 0.01, message: 'Marża musi być większa niż 0' },
          }}
        />
        <NumberInput
          label="Karencja (miesiące)"
          control={control}
          name="gracePeriodMonths"
          rules={{
            required: 'Karencja jest wymagana',
            min: { value: 0, message: 'Karencja musi być większa niż 0' },
          }}
        />
        <DynamicFieldArray
          control={control}
          name="prepayments"
          label="Nadpłaty (wprowadź po jednej, format: Data, Kwota)"
          buttonLabel="Dodaj nadpłatę"
        />
        <DynamicFieldArray
          control={control}
          name="disbursements"
          label="Transze (wprowadź po jednej, format: Data, Kwota)"
          buttonLabel="Dodaj transzę"
        />
        <DynamicFieldArray
          control={control}
          name="holidayMonths"
          label="Wakacje kredytowe (wprowadź po jednej, format: Data)"
          buttonLabel="Dodaj wakacje kredytowe"
        />
        <SelectInput
          label="Typ rat"
          control={control}
          name="installmentType"
          options={[
            { value: 'stałe', label: 'Stałe' },
            { value: 'malejące', label: 'Malejące' },
          ]}
          rules={{ required: 'Typ rat jest wymagany' }}
        />
      </div>
      <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">
        Oblicz
      </button>
    </form>
  );
};

export default ParametersForm;
