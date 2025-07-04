"use client"

import React, { useState, useEffect } from 'react';
import { Trophy, GraduationCap, Plus, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CompactProfileEditForm } from "@/components/compact-profile-edit-form";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface ProfileData {
  targetSchools: Array<{ name: string; priority: number }>;
  experience: Array<{ role: string; company: string; period: string }>;
  testScores: Record<string, Record<string, number | string>>;
  education: Array<{ degree: string; institution: string; years: string; grade: string }>;
}

export function ModernProfile() {
  const [profileData, setProfileData] = useState<ProfileData>({
    targetSchools: [],
    experience: [],
    testScores: {},
    education: []
  });
  const [rawProfileData, setRawProfileData] = useState<any>(null);
  const [schoolTargets, setSchoolTargets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Enable loading for real data
  const { user } = useAuth();
  const { toast } = useToast();

  const supabase = createClient();

  useEffect(() => {
    if (user?.id) {
      loadSchoolTargets().then(() => {
        loadProfileData();
      });
    } else {
      // If no user, just show dummy data and stop loading
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadProfileData = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available, using empty data');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Profile query failed, using empty data:', error.message);
        setIsLoading(false);
        return;
      }

      if (data) {
        // Get work experience from the JSONB field
        const workExperience = data.test_scores?.work_experience || {}
        
        setProfileData({
          targetSchools: schoolTargets.map(target => ({
            name: target.school_name,
            priority: target.priority_score || 5
          })),
          experience: workExperience.role ? [{ 
            role: workExperience.role || "", 
            company: workExperience.company || "", 
            period: (!workExperience.end_date || workExperience.end_date === '') ? "Current" : 
              `${workExperience.start_date || ""} - ${workExperience.end_date || ""}`
          }] : [],
          testScores: data.test_scores || {},
          education: data.highest_degree ? [{
            degree: data.highest_degree || "",
            institution: data.university || "",
            years: data.graduation_year ? String(data.graduation_year) : "",
            grade: data.gpa ? String(data.gpa) : ""
          }] : []
        });
        setRawProfileData(data);
      } else {
        // Profile doesn't exist yet, use empty data
        console.log('No profile data found, using empty data');
        setProfileData({
          targetSchools: schoolTargets.map(target => ({
            name: target.school_name,
            priority: target.priority_score || 5
          })),
          experience: [],
          testScores: {},
          education: []
        });
      }
    } catch (error) {
      console.log('Error loading profile data, using empty data:', error);
      setProfileData({
        targetSchools: schoolTargets.map(target => ({
          name: target.school_name,
          priority: target.priority_score || 5
        })),
        experience: [],
        testScores: {},
        education: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSchoolTargets = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available, using dummy data');
        return [];
      }

      const { data, error } = await supabase
        .from('user_school_targets')
        .select(`
          id,
          school_id,
          program_of_interest,
          application_round,
          notes,
          priority_score,
          target_category,
          created_at,
          mba_schools:school_id (
            id,
            business_school,
            location,
            qs_mba_rank,
            ft_global_mba_rank,
            bloomberg_mba_rank,
            mean_gmat,
            avg_starting_salary,
            tuition_total
          )
        `)
        .eq('user_id', user.id)
        .order('priority_score', { ascending: false });

      if (error) {
        console.log('Database query failed, using dummy data:', error.message);
        return [];
      }

      // Transform the data to flatten school information
      const transformedTargets = data?.map(target => {
        const school = Array.isArray(target.mba_schools) ? target.mba_schools[0] : target.mba_schools;
        return {
          id: target.id,
          school_id: target.school_id,
          school_name: school?.business_school || 'Unknown School',
          location: school?.location || 'Unknown Location',
          program_of_interest: target.program_of_interest,
          application_round: target.application_round,
          notes: target.notes,
          priority_score: target.priority_score,
          target_category: target.target_category,
          created_at: target.created_at,
          // Additional school details
          qs_mba_rank: school?.qs_mba_rank,
          ft_global_mba_rank: school?.ft_global_mba_rank,
          bloomberg_mba_rank: school?.bloomberg_mba_rank,
          mean_gmat: school?.mean_gmat,
          avg_starting_salary: school?.avg_starting_salary,
          tuition_total: school?.tuition_total
        };
      }) || [];

      console.log('Loaded school targets:', transformedTargets);
      setSchoolTargets(transformedTargets);
      return transformedTargets;
    } catch (error) {
      console.log('Error loading school targets, using dummy data:', error);
      return [];
    }
  };

  const refreshProfile = async () => {
    await loadSchoolTargets();
    await loadProfileData();
  };

  const handleFormSave = async (data: any) => {
    // Refresh data after successful save
    await refreshProfile();
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="bg-white rounded-lg shadow p-6">
      <h3 className="text-gray-900 font-semibold mb-4 text-lg">{title}</h3>
      {children}
    </section>
  );

  const convertToFormData = (section: string, displayData: any, profileData?: any) => {
    switch (section) {
      case 'personal':
        if (profileData) {
          return {
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            dateOfBirth: profileData.date_of_birth || '',
            nationality: profileData.nationality || '',
            bio: profileData.bio || '',
            linkedinUrl: profileData.linkedin_url || ''
          };
        }
        return {};
      
      case 'experience':
        if (profileData) {
          // Get work experience from the JSONB field
          const workExperience = profileData.test_scores?.work_experience || {}
          
          return {
            currentRole: workExperience.role || '',
            currentCompany: workExperience.company || '',
            startDate: workExperience.start_date || '',
            endDate: workExperience.end_date || '',
          };
        }
        return {};
      
      case 'education':
        if (profileData) {
          return {
            highestDegree: profileData.highest_degree || '',
            fieldOfStudy: profileData.field_of_study || '',
            university: profileData.university || '',
            graduationYear: profileData.graduation_year ? String(profileData.graduation_year) : '',
            gpa: profileData.gpa ? String(profileData.gpa) : ''
          };
        }
        return {};
      
      case 'scores':
        return profileData?.test_scores || {};
      
      case 'goals':
        if (profileData) {
          return {
            targetDegree: profileData.target_degree || '',
            careerLevel: profileData.career_level || ''
          };
        }
        return {};
      
      case 'scholarships':
        if (profileData) {
          return {
            scholarshipInterest: profileData.scholarship_interest || false,
            budgetRange: profileData.budget_range || '',
            financialAidNeeded: profileData.financial_aid_needed || false
          };
        }
        return {};
      
      default:
        return displayData;
    }
  };

  const getDisplayValue = (type: string, value: string) => {
    switch (type) {
      case 'targetDegree':
        const degreeMap: { [key: string]: string } = {
          'mba': 'MBA',
          'ms': 'Master of Science',
          'ma': 'Master of Arts',
          'phd': 'PhD',
          'executive-mba': 'Executive MBA',
          'professional': 'Professional Degree'
        };
        return degreeMap[value] || value;
      
      case 'careerLevel':
        const levelMap: { [key: string]: string } = {
          'entry': 'Entry Level (0-2 years)',
          'mid': 'Mid Level (3-7 years)',
          'senior': 'Senior Level (8-15 years)',
          'executive': 'Executive (15+ years)'
        };
        return levelMap[value] || value;
      
      default:
        return value;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Target Schools Section */}
      <Section title="Target Schools">
        {schoolTargets.length > 0 ? (
          <table className="min-w-full border border-gray-200 border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="border border-gray-200 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schoolTargets.map((target, idx) => (
                <tr key={target.id} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
                  <td className="border border-gray-200 px-4 py-2 text-gray-700 text-sm">{target.school_name}</td>
                  <td className="border border-gray-200 px-4 py-2 text-gray-700 text-sm text-center">{target.priority_score || 5}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-gray-500 hover:text-blue-600">
                          <Edit className="w-3 h-3" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[70vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Target Schools</DialogTitle>
                          <DialogDescription>
                            Update your target universities and programs
                          </DialogDescription>
                        </DialogHeader>
                        <CompactProfileEditForm 
                          section="universities" 
                          data={{ 
                            schoolTargets: schoolTargets.map(target => ({
                              id: target.id,
                              school_id: target.id,
                              school_name: target.school_name,
                              location: target.location || 'Unknown',
                              ranking_tier: 'target',
                              priority_score: target.priority_score || 5,
                              application_round: target.application_round
                            }))
                          }}
                          onSave={handleFormSave}
                        />
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No target schools added yet</p>
          </div>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <button className="mt-4 flex items-center text-blue-600 text-xs font-medium hover:underline">
              <Plus className="w-3 h-3 mr-1" /> Add School
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[70vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Target Schools</DialogTitle>
              <DialogDescription>
                Select your target universities and programs
              </DialogDescription>
            </DialogHeader>
            <CompactProfileEditForm 
              section="universities" 
              data={{ schoolTargets: [] }}
              onSave={handleFormSave}
            />
          </DialogContent>
        </Dialog>
      </Section>

      {/* Experience Section */}
      <Section title="Experience">
        {profileData.experience.length > 0 ? (
          <table className="min-w-full border border-gray-200 border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="border border-gray-200 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profileData.experience.map((exp, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
                  <td className="border border-gray-200 px-4 py-2 text-gray-700 text-sm">{exp.role}</td>
                  <td className="border border-gray-200 px-4 py-2 text-gray-700 text-sm">{exp.company}</td>
                  <td className="border border-gray-200 px-4 py-2 text-gray-700 text-sm">{exp.period}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-gray-500 hover:text-blue-600">
                          <Edit className="w-3 h-3" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Edit Work Experience</DialogTitle>
                          <DialogDescription>
                            Update your work experience details
                          </DialogDescription>
                        </DialogHeader>
                        <CompactProfileEditForm 
                          section="experience" 
                          data={convertToFormData('experience', exp, rawProfileData)}
                          onSave={handleFormSave}
                        />
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No work experience added yet</p>
          </div>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <button className="mt-4 flex items-center text-blue-600 text-xs font-medium hover:underline">
              <Plus className="w-3 h-3 mr-1" /> Add Experience
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Work Experience</DialogTitle>
              <DialogDescription>
                Add your current or most recent work experience
              </DialogDescription>
            </DialogHeader>
            <CompactProfileEditForm 
              section="experience" 
              data={{}}
              onSave={handleFormSave}
            />
          </DialogContent>
        </Dialog>
      </Section>

      {/* Test Scores Section */}
      <Section title="Test Scores">
        {Object.keys(profileData.testScores).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(profileData.testScores).map(([test, sections]) => (
              <div key={test} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-gray-800 font-medium text-md">{test}</h4>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-gray-500 hover:text-blue-600">
                        <Edit className="w-3 h-3" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Test Scores</DialogTitle>
                        <DialogDescription>
                          Update your standardized test scores and exam dates
                        </DialogDescription>
                      </DialogHeader>
                                              <CompactProfileEditForm 
                          section="scores" 
                          data={convertToFormData('scores', profileData.testScores, rawProfileData)}
                          onSave={handleFormSave}
                        />
                    </DialogContent>
                  </Dialog>
                </div>
                <table className="min-w-full border border-gray-200 border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      {Object.keys(sections as Record<string, any>).map((section) => (
                        <th key={section} className="border border-gray-200 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{section}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {Object.values(sections as Record<string, any>).map((score, idx) => (
                        <td key={idx} className="border border-gray-200 px-4 py-2 text-center text-gray-700 text-sm">{score}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No test scores added yet</p>
          </div>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <button className="mt-2 flex items-center text-blue-600 text-xs font-medium hover:underline">
              <Plus className="w-3 h-3 mr-1" /> Add Score
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Test Scores</DialogTitle>
              <DialogDescription>
                Add your standardized test scores and exam dates
              </DialogDescription>
            </DialogHeader>
            <CompactProfileEditForm 
              section="scores" 
              data={{}}
              onSave={handleFormSave}
            />
          </DialogContent>
        </Dialog>
      </Section>

      {/* Education Section */}
      <Section title="Education">
        {profileData.education.length > 0 ? (
          <table className="min-w-full border border-gray-200 border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Degree</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Years</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="border border-gray-200 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profileData.education.map((edu, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
                  <td className="border border-gray-200 px-4 py-2 text-gray-700 text-sm">{edu.degree}</td>
                  <td className="border border-gray-200 px-4 py-2 text-gray-700 text-sm">{edu.institution}</td>
                  <td className="border border-gray-200 px-4 py-2 text-gray-700 text-sm">{edu.years}</td>
                  <td className="border border-gray-200 px-4 py-2 text-gray-700 text-sm">{edu.grade}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-gray-500 hover:text-blue-600">
                          <Edit className="w-3 h-3" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Edit Education</DialogTitle>
                          <DialogDescription>
                            Update your educational background and qualifications
                          </DialogDescription>
                        </DialogHeader>
                        <CompactProfileEditForm 
                          section="education" 
                          data={convertToFormData('education', edu, rawProfileData)}
                          onSave={handleFormSave}
                        />
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No education records added yet</p>
          </div>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <button className="mt-4 flex items-center text-blue-600 text-xs font-medium hover:underline">
              <Plus className="w-3 h-3 mr-1" /> Add Education
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Education</DialogTitle>
              <DialogDescription>
                Add your educational background and qualifications
              </DialogDescription>
            </DialogHeader>
            <CompactProfileEditForm 
              section="education" 
              data={{}}
              onSave={handleFormSave}
            />
          </DialogContent>
        </Dialog>
      </Section>

      {/* Career Goals Section */}
      <Section title="Career Goals">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Define your career objectives and target degree to get personalized recommendations.</p>
          
          {rawProfileData?.target_degree || rawProfileData?.career_level ? (
            <div className="bg-gray-50 p-4 rounded border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Career Goals</h4>
                  {rawProfileData.target_degree && (
                    <p className="text-gray-600 text-sm mb-1">
                      <span className="font-medium">Target Degree:</span> {getDisplayValue('targetDegree', rawProfileData.target_degree)}
                    </p>
                  )}
                  {rawProfileData.career_level && (
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Career Level:</span> {getDisplayValue('careerLevel', rawProfileData.career_level)}
                    </p>
                  )}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-gray-500 hover:text-blue-600">
                      <Edit className="w-4 h-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Edit Career Goals</DialogTitle>
                      <DialogDescription>
                        Update your target degree and career objectives
                      </DialogDescription>
                    </DialogHeader>
                    <CompactProfileEditForm 
                      section="goals" 
                      data={convertToFormData('goals', {}, rawProfileData)}
                      onSave={handleFormSave}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded border flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Target Degree & Career Level</h4>
                <p className="text-gray-600 text-sm">Add your career goals to help us provide better guidance.</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-gray-500 hover:text-blue-600">
                    <Edit className="w-4 h-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Career Goals</DialogTitle>
                    <DialogDescription>
                      Define your target degree and career objectives
                    </DialogDescription>
                  </DialogHeader>
                  <CompactProfileEditForm 
                    section="goals" 
                    data={convertToFormData('goals', {}, rawProfileData)}
                    onSave={handleFormSave}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <button className="mt-4 flex items-center text-blue-600 text-xs font-medium hover:underline">
              <Plus className="w-3 h-3 mr-1" /> Add Career Goals
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Career Goals</DialogTitle>
              <DialogDescription>
                Define your target degree and career objectives
              </DialogDescription>
            </DialogHeader>
            <CompactProfileEditForm 
              section="goals" 
              data={convertToFormData('goals', {}, rawProfileData)}
              onSave={handleFormSave}
            />
          </DialogContent>
        </Dialog>
      </Section>

    </div>
  );
}
