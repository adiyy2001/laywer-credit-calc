import { useForm } from 'react-hook-form';

import { useWibor } from '../contexts/WiborContext';
import { CalculationParams } from '../types';

import {
  TextInput,
  NumberInput,
  DateInput,
  DynamicFieldArray,
  SelectInput,
} from './form/components';

interface ParametersFormProps {
  onCalculate: (params: CalculationParams) => void;
}

const ParametersForm: React.FC<ParametersFormProps> = ({ onCalculate }) => {
  const { loading } = useWibor();
  const { control, handleSubmit } = useForm<CalculationParams>({
    defaultValues: {
      borrower: 'JAN KOWALSKI',
      loanAmount: 400000,
      loanTerms: 360,
      margin: 2.5,
      startDate: new Date('2013-02-01'),
      endDate: new Date('2013-03-01'),
      gracePeriodMonths: 0,
      holidayMonths: [],
      prepayments: [],
      disbursements: [],
      installmentType: 'malejące',
    },
  });

  const onSubmit = (data: CalculationParams) => {
    onCalculate(data);
  };

  if (loading) {
    return <div>Ładowanie danych WIBOR...</div>;
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
          name="endDate"
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
        <SelectInput
          label="Wakacje kredytowe (miesiące)"
          control={control}
          name="holidayMonths"
          options={[...Array(12).keys()].map((i) => ({
            value: i.toString(),
            label: new Date(0, i).toLocaleString('default', { month: 'long' }),
          }))}
          rules={{ required: 'Wybór miesiąca jest wymagany' }}
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
