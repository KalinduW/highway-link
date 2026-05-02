"use client";

import { useState, useEffect, useRef } from "react";

interface LocationInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	label?: string;
	required?: boolean;
	className?: string;
}

export default function LocationInput({
	value,
	onChange,
	placeholder = "Enter location",
	label,
	required = false,
	className = "",
}: LocationInputProps) {
	const [locations, setLocations] = useState<string[]>([]);
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [focused, setFocused] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);

	// Fetch all locations once on mount
	useEffect(() => {
		const fetchLocations = async () => {
			try {
				const res = await fetch("/api/locations");
				const data = await res.json();
				if (res.ok) setLocations(data.locations);
			} catch {
				console.error("Failed to fetch locations");
			}
		};
		fetchLocations();
	}, []);

	// Filter suggestions when value changes
	useEffect(() => {
		if (value.length >= 2) {
			const filtered = locations.filter((loc) =>
				loc.toLowerCase().includes(value.toLowerCase())
			);
			setSuggestions(filtered);
			setShowDropdown(filtered.length > 0 && focused);
		} else {
			setSuggestions([]);
			setShowDropdown(false);
		}
	}, [value, locations, focused]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(e.target as Node)
			) {
				setShowDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = (location: string) => {
		onChange(location);
		setShowDropdown(false);
		setFocused(false);
	};

	const highlightMatch = (text: string, query: string) => {
		if (!query) return text;
		const index = text.toLowerCase().indexOf(query.toLowerCase());
		if (index === -1) return text;
		return (
			<>
				{text.slice(0, index)}
				<span className="font-bold text-blue-600">
					{text.slice(index, index + query.length)}
				</span>
				{text.slice(index + query.length)}
			</>
		);
	};

	return (
		<div ref={wrapperRef} className={`relative ${className}`}>
			{label && (
				<label className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
					{label}
				</label>
			)}
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onFocus={() => {
					setFocused(true);
					if (value.length >= 2 && suggestions.length > 0) {
						setShowDropdown(true);
					}
				}}
				onBlur={() => setFocused(false)}
				placeholder={placeholder}
				required={required}
				className="w-full h-11 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
			/>

			{/* Dropdown */}
			{showDropdown && suggestions.length > 0 && (
				<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
					<div className="py-1">
						{suggestions.map((location, index) => (
							<button
								key={index}
								type="button"
								onMouseDown={(e) => {
									e.preventDefault();
									handleSelect(location);
								}}
								className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition flex items-center gap-3"
							>
								<span className="text-gray-400">📍</span>
								<span>{highlightMatch(location, value)}</span>
							</button>
						))}
					</div>
					<div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
						<p className="text-xs text-gray-400">
							{suggestions.length} location{suggestions.length !== 1 ? "s" : ""}{" "}
							found
						</p>
					</div>
				</div>
			)}

			{/* No results */}
			{focused && value.length >= 2 && suggestions.length === 0 && (
				<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
					<div className="px-4 py-3 text-center">
						<p className="text-gray-400 text-sm">
							No locations found for "{value}"
						</p>
						<p className="text-gray-300 text-xs mt-0.5">Try a different name</p>
					</div>
				</div>
			)}
		</div>
	);
}
