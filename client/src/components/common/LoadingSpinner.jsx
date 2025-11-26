const LoadingSpinner = ({ size = "lg" }) => {
	const sizeClass = `loading-${size}`;

	return (<div>
        <span className={`loading loading-spinner loading-xs ${sizeClass}`}></span>
    </div>
    );
};
<span className="loading loading-dots loading-lg"></span>
export default LoadingSpinner;