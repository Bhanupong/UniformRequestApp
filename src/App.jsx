import React, { useState, useEffect } from 'react';
import {
    CheckCircle, Shirt, Contact, Loader2, Plus, Minus, User, MapPin,
    ChevronDown, Camera, X, ArrowLeft, FileText, AlertCircle, Building2, Users
} from 'lucide-react';

// --- Default Mock Data ---
const DEFAULT_SHIRT_CONFIG = [
    { group: "MANAGEMENT", size: "L", active: true },
    { group: "MANAGEMENT", size: "XL", active: true },
    { group: "MANAGEMENT", size: "XXL", active: false },
    { group: "GENERAL", size: "S", active: true },
    { group: "GENERAL", size: "M", active: true },
    { group: "GENERAL", size: "L", active: true },
    { group: "GENERAL", size: "XL", active: true },
    { group: "GENERAL", size: "XXL", active: true },
    { group: "OUTDOOR", size: "Free Size", active: true },
    { group: "OUTDOOR", size: "XXL", active: true }
];

const DEFAULT_BRANCHES = [
    "5001 บางกะปิ", "5002 รามคำแหง", "5003 ลาดพร้าว", "5004 บางแค", "5005 สระบุรี",
    "5006 รังสิต", "5007 พระราม 2", "5008 งามวงศ์วาน", "5009 โคราช", "5010 เชียงใหม่"
];

export default function App() {
    // --- State Management ---
    const [loading, setLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(false);
    const [scriptUrl, setScriptUrl] = useState("https://script.google.com/macros/s/AKfycbwWbRR0MDCyN6yEWtC_WhK7oibMEWsoj9LGDBvEoOggv3B-ZhZ_AdCnwZuYc9db-zUA7Q/exec");

    // Data State
    const [branchesList, setBranchesList] = useState(DEFAULT_BRANCHES);
    const [shirtConfigList, setShirtConfigList] = useState(DEFAULT_SHIRT_CONFIG);

    // UI State
    const [isReviewing, setIsReviewing] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState({}); // { fieldKey: true }
    const [selectedBranch, setSelectedBranch] = useState("");
    const [branchSearch, setBranchSearch] = useState("");
    const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

    // Form Data State
    const [requesterCount, setRequesterCount] = useState(1);
    const [requesters, setRequesters] = useState([{
        id: Date.now(),
        type: "1", title: "", firstName: "", lastName: "",
        area: "1", position: "3", shirtSize: "", image: null, imageName: ""
    }]);

    // --- Effects ---
    useEffect(() => {
        if (scriptUrl) {
            fetchConfigData();
        }
    }, [scriptUrl]);

    const fetchConfigData = async () => {
        setConfigLoading(true);
        try {
            const response = await fetch(scriptUrl);
            const data = await response.json();

            if (data.status === 'success') {
                if (data.branches && data.branches.length > 0) {
                    setBranchesList(data.branches);
                }
                if (data.shirtConfig && data.shirtConfig.length > 0) {
                    setShirtConfigList(data.shirtConfig);
                }
            }
        } catch (error) {
            console.error("Failed to fetch config:", error);
        } finally {
            setConfigLoading(false);
        }
    };

    // --- Logic Handlers ---
    const handleCountChange = (value) => {
        const count = parseInt(value) || 0;
        setRequesterCount(count);
        setRequesters(prev => {
            if (count > prev.length) {
                const newItems = Array.from({ length: count - prev.length }, () => ({
                    id: Date.now() + Math.random(),
                    type: "1", title: "", firstName: "", lastName: "",
                    area: "1", position: "3", shirtSize: "", image: null, imageName: ""
                }));
                return [...prev, ...newItems];
            } else {
                return prev.slice(0, count);
            }
        });
    };

    const updateRequester = (index, field, value) => {
        const newRequesters = [...requesters];
        newRequesters[index][field] = value;
        setRequesters(newRequesters);
    };

    const handleImageUpload = (index, file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newRequesters = [...requesters];
                newRequesters[index].image = reader.result;
                newRequesters[index].imageName = file.name;
                setRequesters(newRequesters);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index) => {
        const newRequesters = [...requesters];
        newRequesters[index].image = null;
        newRequesters[index].imageName = "";
        setRequesters(newRequesters);
    };

    const getShirtOptions = (area, position) => {
        let targetGroup = "GENERAL";
        if (area === "4") {
            targetGroup = "OUTDOOR";
        } else if (position === "1" || position === "2") {
            targetGroup = "MANAGEMENT";
        }
        return shirtConfigList.filter(item => item.group === targetGroup);
    };

    const getTypeLabel = (type) => type === "1" ? "เสื้อ" : type === "2" ? "บัตร" : "เสื้อ+บัตร";
    const getAreaLabel = (area) => {
        switch (area) {
            case "1": return "เซลล์ฟลอร์";
            case "2": return "มอลล์";
            case "3": return "ฟู๊ดคอร์ด";
            case "4": return "สวน/ลานจอด";
            default: return "-";
        }
    };

    const resetForm = () => {
        setIsSubmitted(false);
        setIsReviewing(false);
        setErrors({});
        setSelectedBranch("");
        setBranchSearch("");
        setRequesterCount(1);
        setRequesters([{
            id: Date.now(),
            type: "1", title: "", firstName: "", lastName: "",
            area: "1", position: "3", shirtSize: "", image: null, imageName: ""
        }]);
        window.scrollTo(0, 0);
    };

    // --- Submission Handlers ---
    const handleReview = (e) => {
        e.preventDefault();
        const newErrors = {};

        // 1. Validate Branch
        if (!selectedBranch) {
            newErrors.branch = true;
        }

        // 2. Validate Requesters
        requesters.forEach((req, i) => {
            if (!req.firstName.trim()) newErrors[`firstName_${i}`] = true;
            if (!req.lastName.trim()) newErrors[`lastName_${i}`] = true;

            if ((req.type === "1" || req.type === "3") && !req.shirtSize) {
                newErrors[`shirtSize_${i}`] = true;
            }

            if ((req.type === "2" || req.type === "3") && !req.image) {
                newErrors[`image_${i}`] = true;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            alert("กรุณากรอกข้อมูลในช่องที่ทำเครื่องหมายสีแดงให้ครบถ้วน");
            return;
        }

        setErrors({});
        setIsReviewing(true);
        window.scrollTo(0, 0);
    };

    const clearError = (fieldKey) => {
        if (errors[fieldKey]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[fieldKey];
                return next;
            });
        }
    };

    const handleConfirmSubmit = async () => {
        if (!scriptUrl) {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                setIsSubmitted(true);
            }, 1500);
            return;
        }

        setLoading(true);
        try {
            await fetch(scriptUrl, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify({ branch: selectedBranch, requesters: requesters })
            });
            setLoading(false);
            setIsSubmitted(true);
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6 text-center font-kanit">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-sm w-full space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                            <CheckCircle size={48} className="text-white" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">ส่งข้อมูลสำเร็จ!</h2>
                        <div className="space-y-1">
                            <p className="text-slate-500 font-medium">คำขอของคุณถูกบันทึกเรียบร้อย</p>
                            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                                <Building2 size={14} />
                                <span>{selectedBranch}</span>
                                <span className="mx-1">•</span>
                                <Users size={14} />
                                <span>{requesterCount} รายการ</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={resetForm}
                            className="w-full py-4 bg-[#3e87c6] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#3e87c6]/30 hover:bg-[#357abd] active:scale-[0.97] transition-all flex items-center justify-center gap-3 group"
                        >
                            <span>ทำรายการใหม่</span>
                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F2F2F7] pb-safe font-kanit text-slate-900 selection:bg-[#3e87c6] selection:text-white">
            {/* Header */}
            <div className="pt-4 px-5 pb-4 glass-header sticky top-0 z-40 border-b border-slate-200/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {isReviewing && (
                        <button onClick={() => setIsReviewing(false)} className="p-2 -ml-2 rounded-full hover:bg-slate-200/50 transition-colors">
                            <ArrowLeft size={20} className="text-[#3e87c6]" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                            {isReviewing ? "ตรวจสอบข้อมูล" : "แจ้งเบิกบัตรและชุดพนักงาน"}
                        </h1>
                        <p className="text-slate-500 text-xs mt-0.5 font-normal">
                            {isReviewing ? `${requesterCount} รายการ` : "กรอกข้อมูลให้ครบถ้วน"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto mt-4 px-4 space-y-4">
                {!isReviewing && (
                    <form onSubmit={handleReview} className="space-y-4">
                        {/* Control Card */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                        สาขาที่สังกัด <span className="text-red-500">*</span>
                                    </label>
                                    {configLoading && <span className="text-[10px] text-[#3e87c6] flex items-center"><Loader2 size={10} className="animate-spin mr-1" /> Loading...</span>}
                                </div>
                                <div className="relative">
                                    <MapPin size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.branch ? 'text-red-400' : 'text-slate-400'}`} />
                                    <input
                                        type="text"
                                        className={`w-full pl-9 pr-9 py-2.5 bg-slate-50 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 outline-none text-sm font-medium transition-all ${errors.branch ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-[#3e87c6]'}`}
                                        placeholder={configLoading ? "กำลังโหลด..." : "ค้นหา (เช่น 5005)"}
                                        value={branchSearch}
                                        onChange={(e) => {
                                            setBranchSearch(e.target.value);
                                            setIsBranchDropdownOpen(true);
                                            setSelectedBranch("");
                                            if (errors.branch) clearError('branch');
                                        }}
                                        onFocus={() => setIsBranchDropdownOpen(true)}
                                    />
                                    {selectedBranch && (
                                        <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68c5bc]" />
                                    )}
                                </div>
                                {isBranchDropdownOpen && branchSearch && !selectedBranch && (
                                    <ul className="mt-1 bg-white rounded-lg shadow-lg border border-slate-100 max-h-40 overflow-y-auto absolute z-50 left-4 right-4">
                                        {branchesList.filter(b => b.includes(branchSearch)).map((branch) => (
                                            <li
                                                key={branch}
                                                className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700 text-sm border-b border-slate-50 last:border-0"
                                                onClick={() => {
                                                    setSelectedBranch(branch);
                                                    setBranchSearch(branch);
                                                    setIsBranchDropdownOpen(false);
                                                }}
                                            >
                                                {branch}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="h-px bg-slate-50"></div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">จำนวนผู้เบิก</span>
                                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-100">
                                    <button
                                        type="button"
                                        className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-slate-600 active:scale-95 transition-all"
                                        onClick={() => handleCountChange(Math.max(1, requesterCount - 1))}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="font-semibold text-base min-w-[1.2rem] text-center text-slate-900">{requesterCount}</span>
                                    <button
                                        type="button"
                                        className="w-7 h-7 flex items-center justify-center rounded-md bg-[#3e87c6] text-white shadow-sm active:scale-95 transition-all"
                                        onClick={() => handleCountChange(requesterCount + 1)}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Requesters Cards */}
                        {requesters.map((req, index) => {
                            const showShirt = req.type === "1" || req.type === "3";
                            const showCard = req.type === "2" || req.type === "3";
                            const shirtOptions = getShirtOptions(req.area, req.position);

                            return (
                                <div key={req.id} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden border border-slate-100">
                                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white bg-[#3e87c6] w-5 h-5 flex items-center justify-center rounded-full">
                                                {index + 1}
                                            </span>
                                            <span className="font-semibold text-sm text-slate-900">ข้อมูลพนักงาน</span>
                                        </div>
                                        <div className="relative min-w-[120px]">
                                            <select
                                                className="w-full pl-2 pr-6 py-1 bg-white border border-slate-200 rounded-md text-slate-900 text-xs font-medium outline-none focus:border-[#3e87c6] appearance-none transition-all"
                                                value={req.type}
                                                onChange={(e) => updateRequester(index, "type", e.target.value)}
                                            >
                                                <option value="1">เฉพาะเสื้อ</option>
                                                <option value="2">เฉพาะบัตร</option>
                                                <option value="3">เสื้อและบัตร</option>
                                            </select>
                                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <div className="grid grid-cols-12 gap-2">
                                            <div className="col-span-3">
                                                <input type="text" className="w-full px-2.5 py-2.5 bg-slate-50 rounded-lg text-slate-900 text-sm focus:bg-white focus:ring-1 focus:ring-[#3e87c6] outline-none transition-all" placeholder="คำนำหน้า" value={req.title} onChange={(e) => updateRequester(index, "title", e.target.value)} />
                                            </div>
                                            <div className="col-span-4">
                                                <input
                                                    type="text"
                                                    className={`w-full px-2.5 py-2.5 bg-slate-50 rounded-lg text-slate-900 text-sm focus:bg-white focus:ring-1 outline-none transition-all ${errors[`firstName_${index}`] ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-[#3e87c6]'}`}
                                                    placeholder="ชื่อ *"
                                                    value={req.firstName}
                                                    onChange={(e) => {
                                                        updateRequester(index, "firstName", e.target.value);
                                                        clearError(`firstName_${index}`);
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-5">
                                                <input
                                                    type="text"
                                                    className={`w-full px-2.5 py-2.5 bg-slate-50 rounded-lg text-slate-900 text-sm focus:bg-white focus:ring-1 outline-none transition-all ${errors[`lastName_${index}`] ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-[#3e87c6]'}`}
                                                    placeholder="นามสกุล *"
                                                    value={req.lastName}
                                                    onChange={(e) => {
                                                        updateRequester(index, "lastName", e.target.value);
                                                        clearError(`lastName_${index}`);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="relative">
                                                <select className="w-full px-2.5 py-2.5 bg-slate-50 rounded-lg text-slate-900 text-sm outline-none appearance-none focus:ring-1 focus:ring-[#3e87c6] transition-all" value={req.area} onChange={(e) => { updateRequester(index, "area", e.target.value); updateRequester(index, "shirtSize", ""); }}>
                                                    <option value="1">เซลฟลอร์</option>
                                                    <option value="2">มอลล์</option>
                                                    <option value="3">ฟู้ดคอร์ท</option>
                                                    <option value="4">สวน/ลานจอด</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                            <div className="relative">
                                                <select className="w-full px-2.5 py-2.5 bg-slate-50 rounded-lg text-slate-900 text-sm outline-none appearance-none focus:ring-1 focus:ring-[#3e87c6] transition-all" value={req.position} onChange={(e) => { updateRequester(index, "position", e.target.value); updateRequester(index, "shirtSize", ""); }}>
                                                    <option value="1">หัวหน้างาน</option>
                                                    <option value="2">ผู้ช่วย</option>
                                                    <option value="3">พนักงาน</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {showShirt && (
                                                <div className={`relative ${showCard ? 'w-1/2' : 'w-full'}`}>
                                                    <select
                                                        className={`w-full px-2.5 py-2.5 bg-white border rounded-lg text-slate-900 text-sm outline-none appearance-none focus:ring-1 transition-all ${!req.shirtSize ? 'text-slate-400' : ''} ${errors[`shirtSize_${index}`] ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-slate-200 focus:border-[#3e87c6] focus:ring-[#3e87c6]'}`}
                                                        value={req.shirtSize}
                                                        onChange={(e) => {
                                                            updateRequester(index, "shirtSize", e.target.value);
                                                            clearError(`shirtSize_${index}`);
                                                        }}
                                                    >
                                                        <option value="">เลือกไซส์ *</option>
                                                        {shirtOptions.map((opt, i) => (
                                                            <option key={i} value={opt.size} disabled={!opt.active}>{opt.size} {!opt.active ? '(หมด)' : ''}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={14} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${errors[`shirtSize_${index}`] ? 'text-red-400' : 'text-slate-400'}`} />
                                                </div>
                                            )}
                                            {showCard && (
                                                <div className={`${showShirt ? 'w-1/2' : 'w-full'}`}>
                                                    {!req.image ? (
                                                        <label className={`flex items-center justify-center w-full h-[42px] border border-dashed rounded-lg cursor-pointer transition-all gap-2 group ${errors[`image_${index}`] ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-[#3e87c6]'}`}>
                                                            <Camera size={16} className={`${errors[`image_${index}`] ? 'text-red-400' : 'text-slate-400 group-hover:text-[#3e87c6]'}`} />
                                                            <span className={`text-xs ${errors[`image_${index}`] ? 'text-red-500 font-medium' : 'text-slate-500 group-hover:text-slate-700'}`}>รูปถ่าย *</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    handleImageUpload(index, e.target.files[0]);
                                                                    clearError(`image_${index}`);
                                                                }}
                                                            />
                                                        </label>
                                                    ) : (
                                                        <div className="relative w-full h-[42px] bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
                                                            <img src={req.image} alt="Preview" className="w-full h-full object-cover opacity-80" />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="text-[10px] text-white font-medium">เปลี่ยน</span></div>
                                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(index, e.target.files[0])} />
                                                            <button type="button" onClick={(e) => { e.preventDefault(); removeImage(index); }} className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white z-10 hover:bg-red-600"><X size={10} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-xl text-white font-semibold text-base shadow-md shadow-[#3e87c6]/20 transform transition-all active:scale-[0.98] flex items-center justify-center mt-6 mb-8 ${loading ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-[#3e87c6] hover:bg-[#357abd]'}`}>
                            ตรวจสอบข้อมูล <FileText className="ml-2" size={18} />
                        </button>
                    </form>
                )}

                {isReviewing && (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                        <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 size={16} className="text-slate-400" />
                                <div>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase">สาขา</p>
                                    <p className="text-sm font-semibold text-[#3e87c6] leading-tight">{selectedBranch}</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-slate-100 mx-2"></div>
                            <div className="flex items-center gap-2 text-right">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase">ผู้เบิก</p>
                                    <p className="text-sm font-semibold text-slate-900 leading-tight">{requesterCount} คน</p>
                                </div>
                                <Users size={16} className="text-slate-400" />
                            </div>
                        </div>
                        {/* Summary List */}
                        <div className="space-y-2 pb-4">
                            {requesters.map((req, index) => (
                                <div key={req.id} className="bg-white p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-50 flex gap-3">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#3e87c6]/10 flex items-center justify-center text-xs font-bold text-[#3e87c6] overflow-hidden border border-slate-100">
                                        {req.image ? (
                                            <img src={req.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-sm font-semibold text-slate-900 truncate pr-2">
                                                {req.title}{req.firstName} {req.lastName}
                                            </h3>
                                            <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                                                {getTypeLabel(req.type)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                                            {getAreaLabel(req.area)} · {req.position === "1" ? "หน." : req.position === "2" ? "ผช." : "พง."}
                                        </p>
                                        <div className="flex gap-2 mt-1.5">
                                            {(req.type === "1" || req.type === "3") && (
                                                <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                    <Shirt size={10} /> {req.shirtSize || "-"}
                                                </span>
                                            )}
                                            {(req.type === "2" || req.type === "3") && (
                                                <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${req.image ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-500 bg-red-50 border-red-100'}`}>
                                                    <Camera size={10} /> {req.image ? "OK" : "No Pic"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-50">
                            <div className="max-w-md mx-auto flex gap-3">
                                <button onClick={() => setIsReviewing(false)} className="flex-1 py-3 rounded-xl text-slate-600 font-medium text-sm bg-slate-100 active:bg-slate-200 transition-colors">
                                    แก้ไข
                                </button>
                                <button onClick={handleConfirmSubmit} disabled={loading} className={`flex-[2] py-3 rounded-xl text-white font-semibold text-sm shadow-lg shadow-[#3e87c6]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-[#3e87c6] hover:bg-[#357abd]'}`}>
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                    ยืนยันส่งข้อมูล
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
