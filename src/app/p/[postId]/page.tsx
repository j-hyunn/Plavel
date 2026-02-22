'use client';
import BottomNav from '@/components/layout/BottomNav';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, ChevronRight, Heart, MessageCircle, Send, Bookmark, ChevronLeft, Trash2, Plane, Utensils, X, ChevronRight as ChevronRightIcon, ChevronLeft as ChevronLeftIcon, ExternalLink } from 'lucide-react';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { useLoadScript, GoogleMap, MarkerF, PolylineF } from '@react-google-maps/api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    if (d < 1000) return `${Math.round(d)}m`;
    return `${(d / 1000).toFixed(1)}km`;
}

const MapRouteRenderer = ({ allPlaces, filteredPlaces, selectedMapDay }: { allPlaces: any[], filteredPlaces: any[], selectedMapDay: string | number }) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);

    useEffect(() => {
        if (map && filteredPlaces.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            filteredPlaces.forEach(p => {
                if (Math.abs(Number(p.lat)) > 0) bounds.extend({ lat: Number(p.lat), lng: Number(p.lng) });
            });

            if (filteredPlaces.length === 1) {
                map.setCenter({ lat: Number(filteredPlaces[0].lat), lng: Number(filteredPlaces[0].lng) });
                map.setZoom(14);
            } else {
                map.fitBounds(bounds, 50);
            }
        }
    }, [map, filteredPlaces]);

    if (!filteredPlaces.length) return null;

    const days = Array.from(new Set(filteredPlaces.map(p => p.dayNumber)));

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: Number(filteredPlaces[0].lat), lng: Number(filteredPlaces[0].lng) }}
            zoom={14}
            options={{ disableDefaultUI: true, gestureHandling: 'greedy' }}
            onLoad={map => setMap(map)}
        >
            {days.map(dayNum => {
                const dayPlaces = filteredPlaces.filter(p => p.dayNumber === dayNum);
                return (
                    <PolylineF
                        key={`poly-day-${dayNum}`}
                        path={dayPlaces.map(p => ({ lat: Number(p.lat), lng: Number(p.lng) }))}
                        options={{ strokeColor: '#933FFB', strokeOpacity: 0.8, strokeWeight: 3 }}
                    />
                );
            })}
            {filteredPlaces.map((p: any, pIdx: number) => (
                <MarkerF
                    key={`marker-${p.dayNumber}-${pIdx}`}
                    position={{ lat: Number(p.lat), lng: Number(p.lng) }}
                    label={{ text: String(pIdx + 1), color: 'white', fontSize: '11px', fontWeight: 'bold' }}
                    title={`Day ${p.dayNumber} - ${p.name}`}
                />
            ))}
        </GoogleMap>
    );
};

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.postId as string;
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [selectedMapDay, setSelectedMapDay] = useState<number | 'all'>('all');
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [allImages, setAllImages] = useState<string[]>([]);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [topActiveIndex, setTopActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id;
                if (session) setCurrentUser(session.user);

                const postData = await api.getPostDetail(postId, userId);
                const commentsData = await api.getComments(postId);
                setPost(postData);
                setComments(commentsData);
            } catch (error) {
                console.error('Error fetching post detail:', error);
            } finally {
                setLoading(false);
            }
        };
        if (postId) fetchPost();
    }, [postId]);

    useEffect(() => {
        if (fullscreenImage) {
            document.body.style.overflow = 'hidden';

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'ArrowRight') handleNextImg();
                if (e.key === 'ArrowLeft') handlePrevImg();
                if (e.key === 'Escape') setFullscreenImage(null);
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [fullscreenImage, currentImgIndex]);

    const handleNextImg = () => {
        if (allImages.length === 0 || !scrollRef.current) return;
        const nextIdx = (currentImgIndex + 1) % allImages.length;
        scrollRef.current.scrollTo({ left: nextIdx * scrollRef.current.offsetWidth, behavior: 'smooth' });
    };

    const handlePrevImg = () => {
        if (allImages.length === 0 || !scrollRef.current) return;
        const prevIdx = (currentImgIndex - 1 + allImages.length) % allImages.length;
        scrollRef.current.scrollTo({ left: prevIdx * scrollRef.current.offsetWidth, behavior: 'smooth' });
    };

    const openFullscreen = (url: string, list: string[]) => {
        setAllImages(list);
        const idx = list.indexOf(url);
        setCurrentImgIndex(idx >= 0 ? idx : 0);
        setFullscreenImage(url);
    };

    useEffect(() => {
        if (fullscreenImage && scrollRef.current) {
            // Initial scroll to the clicked image without animation
            scrollRef.current.scrollLeft = currentImgIndex * scrollRef.current.offsetWidth;
        }
    }, [fullscreenImage]);

    const handleDelete = async () => {
        if (confirm("정말 이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            try {
                await api.deletePost(postId);
                router.push('/');
            } catch (error) {
                alert("게시물 삭제 중 오류가 발생했습니다.");
            }
        }
    };

    const handleLike = async () => {
        if (!currentUser) return alert('로그인이 필요합니다.');
        const newLiked = !post.isLiked;

        // Optimistic UI update
        setPost((prev: any) => ({
            ...prev,
            isLiked: newLiked,
            likes_count: newLiked ? (prev.likes_count || 0) + 1 : Math.max(0, (prev.likes_count || 0) - 1)
        }));

        try {
            if (newLiked) await api.likePost(postId, currentUser.id);
            else await api.unlikePost(postId, currentUser.id);
        } catch (err) {
            // Revert on error
            setPost((prev: any) => ({
                ...prev,
                isLiked: !newLiked,
                likes_count: !newLiked ? (prev.likes_count || 0) + 1 : Math.max(0, (prev.likes_count || 0) - 1)
            }));
            console.error(err);
        }
    };

    const handleBookmark = async () => {
        if (!currentUser) return alert('로그인이 필요합니다.');
        const newBookmarked = !post.isBookmarked;

        // Optimistic UI update
        setPost((prev: any) => ({
            ...prev,
            isBookmarked: newBookmarked
        }));

        try {
            if (newBookmarked) await api.bookmarkPost(postId, currentUser.id);
            else await api.unbookmarkPost(postId, currentUser.id);
        } catch (err) {
            // Revert
            setPost((prev: any) => ({ ...prev, isBookmarked: !newBookmarked }));
            console.error(err);
        }
    };

    const submitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!currentUser) return alert('로그인이 필요합니다.');

        try {
            const added = await api.addComment(postId, currentUser.id, newComment.trim());
            setComments(prev => [...prev, added]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment', error);
            alert('댓글 작성 중 오류가 발생했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>게시물을 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans mb-16">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                <button onClick={() => window.history.back()} className="text-gray-900 hover:text-primary transition-colors w-10">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200">
                        <img src={post.author?.avatar_url || 'https://i.pravatar.cc/150'} alt={post.author?.nickname} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold text-sm text-gray-800">{post.author?.nickname || 'Unknown'}</span>
                </div>
                <div className="w-10 flex justify-end">
                    {currentUser?.id === post.author_id && (
                        <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 pb-24 mx-auto w-full max-w-2xl bg-white md:my-8 md:rounded-2xl md:shadow-sm md:overflow-hidden md:h-fit">
                {/* Image Section */}
                <div className="w-full bg-gray-50 border-b border-gray-100 p-0 relative group">
                    {(() => {
                        let coverImages = [];
                        if (post.images && Array.isArray(post.images) && post.images.length > 0) {
                            coverImages = post.images;
                        } else {
                            try {
                                const parsed = JSON.parse(post.cover_image_url);
                                coverImages = Array.isArray(parsed) ? parsed : [post.cover_image_url];
                            } catch {
                                coverImages = [post.cover_image_url];
                            }
                        }

                        // Collect ALL images for this post (Cover + All Day Images)
                        const allPostImages = [...coverImages];
                        post.day_plans?.forEach((dp: any) => { if (dp.images) allPostImages.push(...dp.images); });

                        return (
                            <>
                                <div
                                    className={cn("w-full bg-gray-100 overflow-x-auto flex snap-x snap-mandatory scrollbar-none")}
                                    onScroll={(e) => {
                                        const scrollLeft = e.currentTarget.scrollLeft;
                                        const width = e.currentTarget.offsetWidth;
                                        if (width > 0) {
                                            setTopActiveIndex(Math.round(scrollLeft / width));
                                        }
                                    }}
                                >
                                    {allPostImages.map((img: string, idx: number) => (
                                        <div key={idx} className="relative flex-shrink-0 w-full aspect-square md:aspect-video snap-center snap-always cursor-pointer" onClick={() => openFullscreen(img, allPostImages)}>
                                            <img src={img} alt={`post image ${idx}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>

                                {allPostImages.length > 1 && (
                                    <div className="absolute top-4 right-4 bg-black/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md z-10 transition-opacity">
                                        {topActiveIndex + 1} / {allPostImages.length}
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{post.title}</h1>
                        <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl w-full">
                            <div className="flex-1 space-y-1.5 flex flex-col items-center">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-center">시작일</label>
                                <div className="flex items-center gap-1.5 justify-center">
                                    <Calendar className="w-4 h-4 text-primary/60" />
                                    <span className="text-sm font-semibold text-gray-700">{post.travel_start_date ? format(new Date(post.travel_start_date), 'yyyy.MM.dd') : '-'}</span>
                                </div>
                            </div>
                            <div className="w-px bg-gray-200 my-1"></div>
                            <div className="flex-1 space-y-1.5 flex flex-col items-center">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-center">종료일</label>
                                <div className="flex items-center gap-1.5 justify-center">
                                    <Calendar className="w-4 h-4 text-primary/60" />
                                    <span className="text-sm font-semibold text-gray-700">{post.travel_end_date ? format(new Date(post.travel_end_date), 'yyyy.MM.dd') : '-'}</span>
                                </div>
                            </div>
                        </div>
                        {post.caption && (
                            <div className="pt-2">
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {post.caption}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Itinerary Info */}
                    {post.day_plans && post.day_plans.length > 0 && (() => {
                        const mapPlaces: any[] = [];
                        const sortedDayPlans = [...post.day_plans].sort((a: any, b: any) => a.day_number - b.day_number);
                        const daysParsed = sortedDayPlans.map((day: any) => {
                            let parsedPlaces: any[] = [];
                            let textDesc = day.description || '';
                            const dayImages = day.images || [];

                            if (day.day_places && day.day_places.length > 0) {
                                // New Schema
                                parsedPlaces = day.day_places.sort((a: any, b: any) => a.sequence - b.sequence).map((p: any) => {
                                    if (p.lat && p.lng) {
                                        mapPlaces.push({ name: p.place_name, lat: p.lat, lng: p.lng, dayNumber: day.day_number });
                                    }
                                    return { name: p.place_name, lat: p.lat, lng: p.lng, google_types: p.google_types };
                                });
                            } else {
                                // Old Schema fallback
                                const descParts = (day.description || '').split('[방문 장소]');
                                textDesc = descParts[0].trim();
                                const placesStrs = descParts.length > 1 ? descParts[1].trim().split('\n').filter(Boolean) : [];

                                parsedPlaces = placesStrs.map((pStr: string) => {
                                    const [name, coords] = pStr.split('|');
                                    if (coords) {
                                        const [lat, lng] = coords.split(',').map(Number);
                                        if (!isNaN(lat) && !isNaN(lng)) {
                                            mapPlaces.push({ name, lat, lng, dayNumber: day.day_number });
                                        }
                                        return { name, lat, lng };
                                    }
                                    return { name: pStr };
                                });
                            }

                            return { ...day, textDesc, parsedPlaces, images: dayImages };
                        });

                        return (
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">일정 상세 & 경로</h2>

                                {/* Day Filter Slider */}
                                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
                                    <button
                                        onClick={() => setSelectedMapDay('all')}
                                        className={cn("whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors", selectedMapDay === 'all' ? "bg-primary text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100")}
                                    >
                                        전체
                                    </button>
                                    {daysParsed.map((day: any) => (
                                        <button
                                            key={day.day_number}
                                            onClick={() => setSelectedMapDay(day.day_number)}
                                            className={cn("whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors", selectedMapDay === day.day_number ? "bg-primary text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100")}
                                        >
                                            Day {day.day_number}
                                        </button>
                                    ))}
                                </div>

                                {/* Google Map Route */}
                                {isLoaded && mapPlaces.length > 0 && (() => {
                                    const filteredPlaces = selectedMapDay === 'all'
                                        ? mapPlaces
                                        : mapPlaces.filter((p: any) => p.dayNumber === selectedMapDay);

                                    return (
                                        <div className="w-full h-64 bg-white rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
                                            {filteredPlaces.length > 0 ? (
                                                <MapRouteRenderer selectedMapDay={selectedMapDay} allPlaces={mapPlaces} filteredPlaces={filteredPlaces} />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                                                    <MapPin className="w-8 h-8 text-gray-300 mb-2" />
                                                    <p className="text-sm text-gray-400 font-medium">선택한 날짜에 표시할 장소가 없습니다.</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                <div className="space-y-3">
                                    {daysParsed
                                        .filter((day: any) => selectedMapDay === 'all' || day.day_number === selectedMapDay)
                                        .map((day: any) => (
                                            <div key={day.id} className="flex gap-3 items-start bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all">
                                                <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center border border-primary/20">
                                                    <span className="text-sm font-extrabold text-primary">D{day.day_number}</span>
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-4 pt-1">
                                                    <div className="space-y-1">
                                                        {day.title && <h3 className="text-sm font-bold text-gray-800">{day.title}</h3>}
                                                        {day.textDesc && <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">{day.textDesc}</p>}
                                                    </div>

                                                    {day.images && day.images.length > 0 && (
                                                        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none snap-x snap-mandatory">
                                                            {day.images.map((img: string, i: number) => (
                                                                <div key={i} className="relative flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden shadow-sm border border-gray-100/50 snap-start snap-always cursor-pointer" onClick={() => openFullscreen(img, day.images)}>
                                                                    <img src={img} alt={`day ${day.day_number} photo ${i}`} className="w-full h-full object-cover" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {day.parsedPlaces && day.parsedPlaces.length > 0 && (
                                                        <div className="pt-2 border-t border-gray-100 mt-3 pt-4">
                                                            {day.parsedPlaces.map((place: any, pIdx: number) => {
                                                                const googleTypes = place.google_types || [];
                                                                const name = place.name?.toLowerCase() || '';
                                                                const isAirport = name.includes('공항') || name.includes('airport') || googleTypes.includes('airport');
                                                                const isFood = name.includes('식당') || name.includes('음식점') || name.includes('맛집') ||
                                                                    name.includes('카페') || name.includes('커피') || name.includes('레스토랑') ||
                                                                    name.includes('restaurant') || name.includes('cafe') || name.includes('bistro') ||
                                                                    name.includes('dining') || name.includes('chez') || name.includes('bar') ||
                                                                    googleTypes.some((t: string) => ['restaurant', 'food', 'cafe', 'bar', 'bakery', 'meal_takeaway', 'meal_delivery'].includes(t));
                                                                const Icon = isAirport ? Plane : (isFood ? Utensils : MapPin);

                                                                const prevPlace = pIdx > 0 ? day.parsedPlaces[pIdx - 1] : null;
                                                                const distance = prevPlace && prevPlace.lat && prevPlace.lng && place.lat && place.lng
                                                                    ? getDistance(prevPlace.lat, prevPlace.lng, place.lat, place.lng)
                                                                    : null;

                                                                const handlePlaceClick = (e: React.MouseEvent) => {
                                                                    e.stopPropagation();
                                                                    const url = place.lat && place.lng
                                                                        ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
                                                                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
                                                                    window.open(url, '_blank');
                                                                };

                                                                return (
                                                                    <div key={pIdx} className="flex flex-col w-full">
                                                                        {distance && (
                                                                            <div className="flex items-center pl-[27px] py-0.5">
                                                                                <div className="h-5 w-px border-l-2 border-dashed border-primary/30"></div>
                                                                                <span className="text-[10px] font-bold text-primary px-2 opacity-80">{distance}</span>
                                                                            </div>
                                                                        )}
                                                                        <div
                                                                            onClick={handlePlaceClick}
                                                                            className="group flex items-center gap-3 bg-gray-50/80 rounded-xl p-3 border border-gray-100/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
                                                                        >
                                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                                                                <Icon className="w-4 h-4 text-primary" />
                                                                            </div>
                                                                            <div className="flex-1 flex items-center justify-between gap-2 overflow-hidden">
                                                                                <span className="text-xs font-semibold text-gray-800 leading-tight truncate">{place.name}</span>
                                                                                <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Interaction */}
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div onClick={handleLike} className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors cursor-pointer group">
                                <Heart className={cn("w-6 h-6 transition-transform group-active:scale-95", post.isLiked ? "fill-red-500 text-red-500" : "")} />
                                <span className={cn("font-semibold text-sm", post.isLiked ? "text-red-500" : "")}>{post.likes_count || 0}</span>
                            </div>
                            <MessageCircle className="w-6 h-6 text-gray-600 hover:text-primary transition-colors cursor-pointer" />
                        </div>
                        <Bookmark onClick={handleBookmark} className={cn("w-6 h-6 text-gray-600 hover:text-primary transition-colors cursor-pointer", post.isBookmarked ? "fill-black text-black" : "")} />
                    </div>

                    {/* Comments Section */}
                    <div className="pt-6 mt-6 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">댓글 {comments.length}개</h3>

                        <div className="space-y-4 mb-6">
                            {comments.map((comment: any) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
                                        <img src={comment.author?.avatar_url || 'https://i.pravatar.cc/150'} alt="avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-semibold text-sm text-gray-900">{comment.author?.nickname || 'Unknown'}</span>
                                            <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Comment Input */}
                        <form onSubmit={submitComment} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
                                <img src={currentUser?.avatar_url || 'https://i.pravatar.cc/150'} alt="avatar" className="w-full h-full object-cover" />
                            </div>
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="댓글 달기..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="font-bold text-sm text-primary disabled:text-primary/40 disabled:cursor-not-allowed px-2 transition-colors"
                            >
                                게시
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Fullscreen Image Swipe Viewer */}
            {fullscreenImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm transition-all animate-in fade-in duration-200"
                    onClick={() => setFullscreenImage(null)}
                >
                    {/* Top Controls */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[110] bg-gradient-to-b from-black/60 to-transparent">
                        <div className="text-white font-bold text-sm bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                            {currentImgIndex + 1} / {allImages.length}
                        </div>
                        <button
                            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors border border-white/10 backdrop-blur-md"
                            onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation Buttons (Desktop Only) */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-all border border-white/10 backdrop-blur-md"
                                onClick={(e) => { e.stopPropagation(); handlePrevImg(); }}
                            >
                                <ChevronLeftIcon className="w-8 h-8" />
                            </button>
                            <button
                                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-[110] bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-all border border-white/10 backdrop-blur-md"
                                onClick={(e) => { e.stopPropagation(); handleNextImg(); }}
                            >
                                <ChevronRightIcon className="w-8 h-8" />
                            </button>
                        </>
                    )}

                    {/* Swipeable Container */}
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto snap-x snap-mandatory h-full w-full scrollbar-none"
                        onScroll={(e) => {
                            const scrollLeft = e.currentTarget.scrollLeft;
                            const width = e.currentTarget.offsetWidth;
                            if (width > 0) {
                                const idx = Math.round(scrollLeft / width);
                                if (idx !== currentImgIndex && idx >= 0 && idx < allImages.length) {
                                    setCurrentImgIndex(idx);
                                }
                            }
                        }}
                    >
                        {allImages.map((img, idx) => (
                            <div key={idx} className="flex-shrink-0 w-screen h-screen flex items-center justify-center snap-center snap-always">
                                <img
                                    src={img}
                                    alt={`preview ${idx}`}
                                    className="max-w-full max-h-screen w-auto h-auto object-contain animate-in zoom-in-95 duration-300 pointer-events-none md:pointer-events-auto"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
