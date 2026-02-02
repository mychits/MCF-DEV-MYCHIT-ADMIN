const Receipt = ({ id, orderType, user_name, others, status, collectedBy, createdAt, viewMode = 'grid' }) => {

  const getStatusStyles = (stat) => {
    switch (stat?.toUpperCase()) {
      case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
      case 'ACTIVE': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  if (viewMode === 'list') {
    // List View (Table Row Style)
    return (
      <div className="grid grid-cols-[60px_120px_1fr_1.5fr_120px_100px_120px] items-center bg-white p-4 border-b border-gray-200 hover:bg-gray-50 font-mono text-xs transition-colors gap-4">

        <div className="text-gray-400">#{id}</div>

        <div className="text-gray-500 truncate">
          {createdAt || ''}
        </div>

        <div className="font-bold uppercase truncate">
          {user_name || "N/A"}
        </div>

        <div className="text-gray-600 italic truncate pr-4">
          {others || "N/A"}
        </div>

        <div className="font-semibold truncate uppercase">
          {orderType || "N/A"}
        </div>

        <div className="flex justify-start">
          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold whitespace-nowrap ${getStatusStyles(status)}`}>
            {status || "N/A"}
          </span>
        </div>

        <div className="text-right text-gray-500 truncate">
          {collectedBy || 'Admin'}
        </div>

      </div>
    );
  }


  return (
    <div className="bg-white p-5 shadow-md border border-gray-200 rounded-sm font-mono text-xs text-gray-800 w-full hover:shadow-lg transition-shadow">
      <div className="text-center mb-3">
        <h2 className="text-sm font-bold uppercase tracking-tighter">Transaction Receipt</h2>
        <p className="opacity-60 text-[10px]"># {id}</p>
      </div>
      <div className="border-t border-dashed border-gray-300 my-3" />
      <div className="space-y-2">
        <div className="flex justify-between gap-2">
          <span className="text-gray-500 uppercase">Type:</span>
          <span className="font-bold text-right">{orderType}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500 uppercase">Customer:</span>
          <span className="font-bold text-right">{user_name || "N/A"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-500 uppercase">Status:</span>
          <span className={`px-1.5 py-0.5 rounded border font-bold ${getStatusStyles(status)}`}>
            {status}
          </span>
        </div>
      </div>
      <div className="border-t border-dashed border-gray-300 my-3" />
      <div className="min-h-[40px]">
        <span className="text-gray-500 uppercase block mb-1">Details:</span>
        <p className="italic text-[10px] leading-tight text-gray-600 line-clamp-2">{others || "N/A"}</p>
      </div>
      <div className="border-t-2 border-double border-gray-300 mt-4 pt-2 text-center">
        <p className="text-[10px] text-gray-400 uppercase">Collected By</p>
        <p className="font-bold text-gray-700 uppercase">{collectedBy || 'ADMIN'}</p>
      </div>

      <div className="border-t-2 border-double border-gray-300 mt-4 pt-2 text-center">
        <p className="text-[10px] text-gray-400 uppercase">Transaction Date</p>
        <p className="font-bold text-gray-700 uppercase">{createdAt || 'N/A'}</p>
      </div>
    </div>
  );
};

export default Receipt;