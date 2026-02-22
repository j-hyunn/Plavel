import { X, Check } from 'lucide-react';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    editNickname: string;
    setEditNickname: (nickname: string) => void;
    editBio: string;
    setEditBio: (bio: string) => void;
    onUpdateProfile: () => void;
    isUpdating: boolean;
}

export default function ProfileEditModal({
    isOpen,
    onClose,
    editNickname,
    setEditNickname,
    editBio,
    setEditBio,
    onUpdateProfile,
    isUpdating
}: ProfileEditModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">프로필 편집</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">닉네임</label>
                        <input
                            type="text"
                            value={editNickname}
                            onChange={(e) => setEditNickname(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="사용할 닉네임을 입력하세요"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">소개</label>
                        <textarea
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24"
                            placeholder="자신을 소개해보세요"
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={onUpdateProfile}
                        disabled={isUpdating || !editNickname.trim()}
                        className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        {isUpdating ? '저장 중...' : (
                            <>
                                <Check className="w-4 h-4" />
                                저장하기
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
