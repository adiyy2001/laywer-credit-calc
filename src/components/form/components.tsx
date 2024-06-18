import {
  useController,
  UseControllerProps,
  Control,
  useFieldArray,
  Controller,
} from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

interface DynamicField {
  date: Date;
  amount: number;
}

interface CalculationParams {
  borrower: string;
  loanAmount: number;
  loanTerms: number;
  margin: number;
  wiborRate: number;
  currentRate: number;
  startDate: Date;
  endDate: Date;
  gracePeriod: boolean;
  holiday: boolean;
  prepayments: DynamicField[];
  disbursements: DynamicField[];
}

interface FieldWrapperProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  error,
  children,
}) => (
  <div>
    <label className="block mb-1">{label}</label>
    {children}
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

interface TextInputProps extends UseControllerProps<CalculationParams> {
  label: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  control,
  name,
  rules,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name, rules });

  return (
    <FieldWrapper label={label} error={error?.message}>
      <input
        {...field}
        className="border p-2 w-full rounded"
        value={field.value as string}
      />
    </FieldWrapper>
  );
};

interface NumberInputProps extends UseControllerProps<CalculationParams> {
  label: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  control,
  name,
  rules,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name, rules });

  return (
    <FieldWrapper label={label} error={error?.message}>
      <input
        {...field}
        type="number"
        className="border p-2 w-full rounded"
        value={field.value as number}
      />
    </FieldWrapper>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DateInputProps extends UseControllerProps<any> {
  label: string;
  datePickerProps?: Partial<React.ComponentPropsWithoutRef<typeof DatePicker>>;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  control,
  name,
  rules,
  datePickerProps,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name, rules });

  const selectedDate =
    field.value instanceof Date
      ? field.value
      : typeof field.value === 'string'
        ? new Date(field.value)
        : null;

  const handleChange = (date: Date | null) => {
    field.onChange(date);
  };

  return (
    <FieldWrapper label={label} error={error?.message}>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="yyyy-MM-dd"
        className="border p-2 w-full rounded"
        showPopperArrow={true}
        isClearable={true}
        placeholderText="Wybierz datę"
        excludeScrollbar={false}
        icon={null}
        onSelect={() => {}}
        selectsMultiplets={false}
        {...datePickerProps}
      />
    </FieldWrapper>
  );
};

interface CheckboxInputProps extends UseControllerProps<CalculationParams> {
  label: string;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label,
  control,
  name,
  rules,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name, rules });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { value, ...rest } = field;

  return (
    <FieldWrapper label={label} error={error?.message}>
      <input
        {...rest}
        type="checkbox"
        className="border p-2 rounded"
        checked={field.value as boolean}
        onChange={(e) => field.onChange(e.target.checked)}
      />
    </FieldWrapper>
  );
};

interface DynamicFieldArrayProps {
  control: Control<CalculationParams>;
  name: 'prepayments' | 'disbursements';
  label: string;
  buttonLabel: string;
}

const DynamicFieldArray: React.FC<DynamicFieldArrayProps> = ({
  control,
  name,
  label,
  buttonLabel,
}) => {
  const { fields, append } = useFieldArray({
    control,
    name,
  });

  return (
    <div>
      <label className="block mb-1">{label}</label>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center mb-2">
          <Controller
            control={control}
            name={`${name}.${index}.date`}
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                dateFormat="yyyy-MM-dd"
                className="border p-2 w-full rounded"
                showPopperArrow
                isClearable
                placeholderText="Wybierz datę"
                excludeScrollbar={false}
                icon={null}
                onSelect={() => {}}
                selectsMultiplets={false}
              />
            )}
          />
          <Controller
            control={control}
            name={`${name}.${index}.amount`}
            render={({ field }) => (
              <input
                type="number"
                step="0.01"
                className="border p-2 w-full rounded ml-2"
                value={field.value as number}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            )}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ date: new Date(), amount: 0 })}
        className="mt-2 bg-green-500 text-white p-2 rounded"
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export {
  FieldWrapper,
  TextInput,
  NumberInput,
  DateInput,
  CheckboxInput,
  DynamicFieldArray,
};
