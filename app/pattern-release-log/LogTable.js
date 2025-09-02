import React from "react";
import { format } from "date-fns";

const LogTable = ({ filters, filteredLogs, startEditing, deleteLog, getUniqueOptions, setFilters, userInfo }) => {
    return (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">


                    <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Buyer
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Style
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Body
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Team
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Comments
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Added By
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Added At
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>

                    {/* filtering row */}
                    <tr className="bg-white">
                        {Object.keys(filters).map((key) => (
                            <th key={key} className="px-3 py-1">
                                <select
                                    value={filters[key]}
                                    onChange={(e) =>
                                        setFilters({ ...filters, [key]: e.target.value })
                                    }
                                    className="w-full px-2 py-1 border rounded text-sm"
                                >
                                    <option value="">All</option>
                                    {getUniqueOptions(key).map((val) => (
                                        <option key={val} value={val}>
                                            {val}
                                        </option>
                                    ))}
                                </select>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                            <tr key={log?._id} className="hover:bg-gray-50">
                                <td className="px-3 py-3 text-sm text-gray-800">
                                    {new Date(log?.date).toLocaleDateString()}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-800">
                                    {log?.buyer}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-800 font-semibold">
                                    {log?.style}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-800">
                                    {log?.item}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-800">
                                    {log?.body}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-800">
                                    {log?.size}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-800">
                                    {log?.status}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-800">
                                    {log?.user_team}
                                </td>
                                <td
                                    className="px-3 py-3 text-sm text-gray-800 max-w-xs truncate"
                                    title={log?.comments || "-"} // Shows full comment on hover
                                >
                                    {log?.comments?.length > 50 ? `${log.comments.slice(0, 50)}...` : (log?.comments || "-")}
                                </td>

                                <td className="px-3 py-3 text-sm text-gray-800">
                                    {log?.added_by}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-800">
                                    {log?.added_at ? format(log?.added_at, "Pp") : "Not Found"}
                                </td>
                                <td className="px-3 py-3 text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => startEditing(log)}
                                            className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                                        >
                                            Edit
                                        </button>
                                        {
                                            userInfo?.role === "admin" &&
                                            <button
                                                onClick={() => deleteLog(log?._id)}
                                                className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md bg-red-100 hover:bg-red-200 transition-colors duration-200"
                                            >
                                                Delete
                                            </button>
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="px-3 py-3 text-center text-gray-500">
                                No log entries found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default LogTable;