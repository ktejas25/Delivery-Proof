const StarRating = ({ rating, setRating }: any) => {

  return (
    <div className="flex gap-2">

      {[1,2,3,4,5].map((star)=>(
        <button
          key={star}
          onClick={()=>setRating(star)}
          className={`text-3xl transition hover:scale-110 ${
            star <= rating
              ? "text-yellow-400"
              : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}

    </div>
  );
};

export default StarRating;