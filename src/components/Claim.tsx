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
  benefitPerInstallment,
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
          <p className="font-semibold">Zwrot do Klienta zapłaconych odsetek:</p>
          <p>{refund}</p>
          <p>Wartość anulowanych odsetek na przyszłość: {futureInterest}</p>
        </div>
        <div>
          <p className="font-semibold">KORZYŚĆ KREDYTOBIORCY:</p>
          <p>{borrowerBenefit}</p>
        </div>
        <div>
          <p className="font-semibold">
            KORZYŚĆ KREDYTOBIORCY NA KAŻDEJ RACIE:
          </p>
          <p>{benefitPerInstallment}</p>
        </div>
        <div>
          <p className="font-semibold">Wysokość raty:</p>
          <p>Wysokość raty - ZMIENNA AKTUALNA: {variableRate}</p>
          <p>
            {title.includes('II ROSZCZENIE EWENTUALNE')
              ? 'Wysokość raty - STAŁA przez całą okres kredytu'
              : 'Wysokość raty - STAŁA BEZ OPROCEN.'}
            : {fixedRate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Claim;
