'use client';
import BottomNav from '@/components/layout/BottomNav';

import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

export default function CreatePostPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [caption, setCaption] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <BottomNav />

            <main className=" pb-28 min-h-screen flex items-center justify-center p-4">
                <div className="instagram-card w-full max-w-[600px] overflow-hidden">
                    <div className="border-b border-[var(--border)] p-3 flex justify-between items-center">
                        {selectedImage ? (
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="text-gray-500 hover:text-black"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        ) : <div className="w-6" />}
                        <h2 className="font-semibold">새 게시물 만들기</h2>
                        <button
                            disabled={!selectedImage}
                            className={`text-[var(--primary-button)] font-semibold text-sm ${!selectedImage ? 'opacity-30 cursor-default' : 'hover:text-[var(--primary-button-hover)]'}`}
                        >
                            공유하기
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row h-[400px] md:h-[500px]">
                        {/* Image Area */}
                        <div className="flex-1 bg-gray-50 flex items-center justify-center relative border-r border-[var(--border)]">
                            {selectedImage ? (
                                <img src={selectedImage} alt="preview" className="w-full h-full object-contain" />
                            ) : (
                                <label className="flex flex-col items-center gap-4 cursor-pointer">
                                    <ImagePlus className="w-24 h-24 text-gray-400 font-extralight" />
                                    <span className="text-xl text-gray-500">사진을 여기에 끌어다 놓으세요</span>
                                    <div className="bg-[var(--primary-button)] text-white px-4 py-1.5 rounded-lg font-semibold text-sm">컴퓨터에서 선택</div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>

                        {/* Caption Area */}
                        {selectedImage && (
                            <div className="w-full md:w-64 p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100">
                                        <img src="https://i.pravatar.cc/100" alt="me" />
                                    </div>
                                    <span className="font-semibold text-sm">traveler_dev</span>
                                </div>
                                <textarea
                                    placeholder="문구 입력..."
                                    className="w-full h-32 text-sm bg-transparent outline-none resize-none"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                />
                                <div className="border-t border-[var(--border)] pt-4">
                                    <p className="text-xs text-gray-400">위치 추가</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
