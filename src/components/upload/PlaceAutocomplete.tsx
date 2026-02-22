import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface PlaceAutocompleteProps {
    value: string;
    onChange: (address: string, lat?: number, lng?: number, types?: string[]) => void;
    placeholder?: string;
}

export default function PlaceAutocomplete({ value, onChange, placeholder = "방문 장소 검색" }: PlaceAutocompleteProps) {
    const {
        ready,
        value: inputValue,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            // Optional region or language bias can go here
        },
        debounce: 300,
    });

    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync external value with internal input value (e.g. initial load)
    useEffect(() => {
        if (value !== inputValue) {
            setValue(value, false);
        }
    }, [value, setValue, inputValue]);

    // Handle outside click to close suggestions
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (suggestion: any) => {
        const placeName = suggestion.structured_formatting.main_text;
        setValue(placeName, false);
        clearSuggestions();
        setIsFocused(false);

        // Fetch Geocode / LatLng for exact coordinates
        getGeocode({ address: suggestion.description }).then((results) => {
            const { lat, lng } = getLatLng(results[0]);
            onChange(placeName, lat, lng, suggestion.types);
        }).catch((err) => {
            console.error("Geocode error", err);
            onChange(placeName, undefined, undefined, suggestion.types);
        });
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-transparent focus-within:border-primary/30 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <input
                    value={inputValue}
                    onChange={(e) => {
                        setValue(e.target.value);
                        onChange(e.target.value); // Optimistically update external state
                    }}
                    onFocus={() => setIsFocused(true)}
                    disabled={!ready}
                    className="w-full text-xs bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                    placeholder={ready ? placeholder : "지도 스크립트 로딩중..."}
                />
            </div>

            {/* Suggestions Dropdown */}
            {isFocused && status === "OK" && (
                <ul className="absolute z-[100] mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-48 overflow-auto">
                    {data.map((suggestion) => {
                        const {
                            place_id,
                            structured_formatting: { main_text, secondary_text },
                        } = suggestion;

                        return (
                            <li
                                key={place_id}
                                onClick={() => handleSelect(suggestion)}
                                className="px-3 py-2 text-xs flex flex-col gap-0.5 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-none"
                            >
                                <span className="font-semibold text-gray-800">{main_text}</span>
                                <span className="text-[10px] text-gray-400 truncate">{secondary_text}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
