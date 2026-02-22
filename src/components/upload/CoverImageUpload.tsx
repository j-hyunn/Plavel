import React from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoverImageUploadProps {
    coverImage: string | null;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
}

export default function CoverImageUpload({ coverImage, onImageChange, onRemove }: CoverImageUploadProps) {
    return (
        <div className="w-full bg-gray-50 border-b border-gray-100 p-0 relative group">
            <label className="block w-full cursor-pointer overflow-hidden">
                <input type="file" className="hidden" accept="image/*" onChange={onImageChange} />

                <div className={cn(
                    "flex items-center justify-center transition-all duration-300",
                    !coverImage ? "h-64 bg-gray-100 hover:bg-gray-200" : "aspect-video"
                )}>
                    {coverImage ? (
                        <div className="relative w-full h-full">
                            <img src={coverImage} alt="cover preview" className="w-full h-full object-cover transition-filter group-hover:brightness-90" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                                <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                    <ImagePlus className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold text-gray-800">커버 사진 변경</span>
                                </div>
                            </div>
                            <span className="absolute top-4 left-4 bg-primary/90 text-white text-[10px] font-bold px-2.5 py-1 rounded backdrop-blur-sm uppercase tracking-wider shadow-sm">대표 커버</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <ImagePlus className="w-10 h-10 text-gray-200 transition-colors group-hover:text-gray-300" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-400 tracking-tight">커버 사진 추가</p>
                            </div>
                        </div>
                    )}
                </div>
            </label>

            {coverImage && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white backdrop-blur-md hover:bg-black/80 transition-all shadow-lg z-10"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
