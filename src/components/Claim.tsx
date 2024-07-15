interface ClaimProps {
  title: string;
  totalInterestWibor: string;
  totalInterestNoWibor: string;
  variableRate: string;
  fixedRate: string;
  borrowerBenefit: string;
  benefitPerInstallment: string;
  refund: string;
  futureInterest: string;
}

const Claim: React.FC<ClaimProps> = ({
  title,
  totalInterestWibor,
  totalInterestNoWibor,
  variableRate,
  fixedRate,
  borrowerBenefit,
  refund,
  futureInterest,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Suma odsetek:</p>
          <p>WIBOR 3M: {totalInterestWibor}</p>
          <p>
            {title.includes('II ROSZCZENIE EWENTUALNE')
              ? 'STAŁY WIBOR'
              : title.includes('I ROSZCZENIE EWENTUALNE')
                ? 'BEZ WIBORU'
                : 'BEZ WIBORU I MARŻY'}
            : {totalInterestNoWibor}
          </p>
        </div>
        <div>
          <p className="font-semibold">
            {title.includes('GŁÓWNE')
              ? 'Zwrot do Klienta zapłaconych odsetek'
              : 'Zwrot do Klienta nadpłaconych odsetek'}
            :
          </p>
          <p>{refund}</p>
          <p className="font-semibold">
            Wartość anulowanych odsetek na przyszłość:
          </p>
          <p> {futureInterest}</p>
        </div>
        <div>
          <p className="font-semibold">Korzyść Kredytobiorcy:</p>
          <p>{borrowerBenefit}</p>
        </div>
        <div>
          {/* <p className="font-semibold">Wysokość raty:</p>
          <p>Wysokość raty - zmienna aktualna: {variableRate}</p>
          <p>Wysokość raty - stała przez cały okres kredytu: {fixedRate}</p> */}
        </div>
      </div>
    </div>
  );
};

export default Claim;
