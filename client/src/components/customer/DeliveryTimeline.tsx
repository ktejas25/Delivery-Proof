const steps = [
  "scheduled",
  "dispatched",
  "en_route",
  "delivered",
];

const DeliveryTimeline = ({ status }: any) => {

  const current = steps.indexOf(status);

  return (

    <div className="flex justify-between mt-6">

      {steps.map((step,i)=>{

        const active = i <= current;

        return (

          <div key={step} className="flex-1 text-center">

            <div className={`w-4 h-4 mx-auto rounded-full ${
              active ? "bg-green-500" : "bg-gray-300"
            }`} />

            <p className="text-xs mt-2 capitalize">
              {step.replace("_"," ")}
            </p>

          </div>

        );

      })}

    </div>

  );
};

export default DeliveryTimeline;