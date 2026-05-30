import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { User, Phone, CheckCircle, Plus, Trash } from 'lucide-react';

export const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const isRecruiter = user?.role === 'recruiter';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companySize, setCompanySize] = useState('11-50');
  const [companyHeadquarters, setCompanyHeadquarters] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch Profile data
  const { data: profileData, refetch } = useQuery({
    queryKey: ['myProfileForEdit'],
    queryFn: async () => {
      const res = await api.get('/profile/me');
      return res.data.data;
    }
  });

  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.firstName || '');
      setLastName(profileData.lastName || '');
      setPhone(profileData.phone || '');
      setTitle(profileData.title || '');
      setBio(profileData.bio || '');
      setLocation(profileData.location || '');
      setSkills(profileData.skills || []);

      if (profileData.company) {
        setCompanyName(profileData.company.name || '');
        setCompanyWebsite(profileData.company.website || '');
        setCompanyIndustry(profileData.company.industry || '');
        setCompanySize(profileData.company.size || '11-50');
        setCompanyHeadquarters(profileData.company.headquarters || '');
        setCompanyDescription(profileData.company.description || '');
      }
    }
  }, [profileData]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isRecruiter ? '/profile/recruiter' : '/profile/candidate';
      const payload: any = {
        firstName,
        lastName,
        phone,
        title
      };

      if (isRecruiter) {
        payload.companyName = companyName;
        payload.companyWebsite = companyWebsite;
        payload.companyIndustry = companyIndustry;
        payload.companySize = companySize;
        payload.companyDescription = companyDescription;
        payload.companyHeadquarters = companyHeadquarters;
      } else {
        payload.bio = bio;
        payload.location = location;
        payload.skills = skills;
      }

      return await api.put(endpoint, payload);
    },
    onSuccess: () => {
      setSuccess(true);
      refetch();
      setTimeout(() => setSuccess(false), 2000);
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="text-primary-500" />
          My Profile Details
        </h2>
        <p className="text-sm text-slate-500 dark:text-dark-400">Manage credentials, contact detail listings, and professional skill metrics.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900 shadow-sm">
        {success && (
          <div className="mb-6 rounded-xl bg-green-50 border border-green-500/30 p-4 text-xs font-bold text-green-700 dark:bg-green-950/20 dark:text-green-400 flex items-center gap-2">
            <CheckCircle size={14} /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. John"
                className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Doe"
                className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Phone</label>
              <div className="relative">
                <Phone className="absolute top-3.5 left-3.5 text-slate-450" size={16} />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 pl-11 pr-4 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Professional Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Software Engineer"
                className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
              />
            </div>
          </div>

          {isRecruiter ? (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-dark-800 dark:bg-dark-900">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-dark-400">Company Profile</div>
              <p className="text-sm text-slate-500 dark:text-dark-400">Recruiters need a company profile before posting jobs.</p>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Website</label>
                  <input
                    type="text"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://www.acme.com"
                    className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Industry</label>
                  <input
                    type="text"
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                    placeholder="e.g. SaaS, Finance"
                    className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Company Size</label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-3 text-sm focus:outline-none"
                  >
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="501-1000">501-1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Headquarters</label>
                  <input
                    type="text"
                    value={companyHeadquarters}
                    onChange={(e) => setCompanyHeadquarters(e.target.value)}
                    placeholder="e.g. New York, NY"
                    className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Company Description</label>
                <textarea
                  rows={4}
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  placeholder="Describe your company, mission, and the types of roles you hire for."
                  className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm placeholder-slate-400 focus:outline-none resize-none"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Bio Description</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell recruiters about yourself..."
                  className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm placeholder-slate-400 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Add Skill Competencies</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. React, Docker, TypeScript"
                    className="flex-1 rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-2.5 px-4 text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 dark:bg-dark-850 transition-all flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-650 dark:bg-primary-950/20 dark:text-primary-400"
                    >
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)}>
                        <Trash size={12} className="text-red-500 hover:scale-110" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-dark-800/80">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-500 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
