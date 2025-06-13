"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface MBASchool {
  id: string
  name: string
  description: string
  location: string
  country: string
  type: string
  class_size: number
  women_percentage: number
  mean_gmat: number
  mean_gpa: number
  avg_gre: number
  avg_work_exp_years: number
  avg_starting_salary: string
  total_cost: string
  application_deadlines: string
  application_deadlines_structured: Array<{round: string, date: string}>
  application_fee: string
  gmat_gre_waiver_available: boolean
  class_profile: string
  admissions_rounds: string
  qs_mba_rank: number
  ft_global_mba_rank: number
  bloomberg_mba_rank: number
  employment_in_3_months_percent: number
  weighted_salary: string
  top_hiring_companies: string
  top_hiring_companies_array: string[]
  alumni_network_strength: string
  notable_alumni: string
  notable_alumni_structured: Array<{name: string, title: string}>
  program_tags: string[]
  specializations: string[]
  status: string
  created_at: string
  updated_at: string
}

export default function MBASchoolDetailsPage() {
  const params = useParams()
  const [school, setSchool] = useState<MBASchool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isCollapsed, setIsCollapsed] = useState(true)

  useEffect(() => {
    async function fetchSchool() {
      try {
        const response = await fetch(`/api/mba-schools/${params.id}`)
        const result = await response.json()
        
        if (result.success) {
          setSchool(result.data)
        } else {
          setError(result.error || 'Failed to fetch school details')
        }
      } catch (err) {
        setError('Failed to load school details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchSchool()
    }
  }, [params.id])

  const showTab = (tabName: string) => {
    setActiveTab(tabName)
  }

  const toggleCombinedCard = () => {
    setIsCollapsed(!isCollapsed)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error || 'School not found'}</div>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        /* Global reset and basic styling */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8f9fa;
            color: #333;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .dashboard {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 15px;
            gap: 15px;
            min-height: 100vh;
        }

        /* Top Section Layout */
        .top-section {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 15px;
        }
        
        /* School Header Styling */
        .school-header {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .school-title {
            font-size: 1.6rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .school-subtitle {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 8px;
        }
        .location {
            font-size: 0.85rem;
            color: #666;
            margin-bottom: 12px;
        }
        
        /* Action Buttons Styling */
        .action-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            white-space: nowrap;
        }
        .btn-primary {
            background: #22c55e;
            color: white;
        }
        .btn-secondary {
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #e2e8f0;
        }

        /* Quick Stats Styling */
        .quick-stats {
            background: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .stats-title {
            font-size: 1rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 10px;
            text-align: center;
        }
        .key-metrics {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }
        .metric {
            text-align: center;
            padding: 8px;
            background: #f8fafc;
            border-radius: 6px;
            border-left: 3px solid #22c55e;
        }
        .metric-value {
            font-size: 1.1rem;
            font-weight: 700;
            color: #2c3e50;
        }
        .metric-label {
            font-size: 0.7rem;
            color: #666;
            text-transform: uppercase;
        }

        /* Middle Section Layout */
        .middle-section {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        /* Info Card Styling */
        .info-card {
            background: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            cursor: pointer;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: none;
        }
        .card-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 0;
            padding-bottom: 0;
            flex-grow: 1;
        }
        .collapse-icon {
            font-size: 1.5rem;
            font-weight: bold;
            line-height: 1;
            width: 1em;
            text-align: center;
            transition: transform 0.3s ease;
        }

        .collapsible-content {
            max-height: 1000px;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
            padding-top: 10px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 15px;
        }
        .collapsible-content.collapsed {
            max-height: 0;
            padding-top: 0;
            padding-bottom: 0;
            margin-top: 0;
            margin-bottom: 0;
        }

        /* Sub-sections within the combined collapsible card */
        .combined-card-section {
            background: #f8fafc;
            border-radius: 6px;
            padding: 15px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.05);
            border-left: 3px solid #22c55e;
        }
        .combined-card-section:last-child {
            margin-bottom: 0;
        }
        .combined-card-subtitle {
            font-size: 0.95rem;
            font-weight: 600;
            color: #475569;
            margin-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 4px;
            font-size: 0.8rem;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
        }
        .info-label {
            font-weight: 600;
            color: #475569;
        }
        .info-value {
            color: #2c3e50;
            font-weight: 500;
        }
        .rankings-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
        }
        .ranking-item {
            background: white;
            padding: 8px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 3px solid #3b82f6;
        }
        .ranking-name {
            font-size: 0.8rem;
            font-weight: 600;
            color: #475569;
        }
        .ranking-value {
            font-size: 0.9rem;
            font-weight: 700;
            color: #2c3e50;
        }

        /* Main Content and Tabs Styling */
        .main-content {
            flex: 1;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            min-height: 0;
        }
        .tabs {
            display: flex;
            border-bottom: 1px solid #e2e8f0;
            flex-shrink: 0;
            overflow-x: auto;
        }
        .tab {
            padding: 12px 20px;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            white-space: nowrap;
        }
        .tab.active {
            border-bottom-color: #22c55e;
            color: #22c55e;
            background: #f0f9ff;
        }
        .tab-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            min-height: 0;
        }
        .tab-pane {
            display: none;
        }
        .tab-pane.active {
            display: block;
        }

        /* General Content Styling */
        .description {
            font-size: 0.9rem;
            line-height: 1.5;
            color: #4b5563;
            margin-bottom: 15px;
        }
        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 15px;
        }
        .tag {
            background: #f0f9ff;
            color: #0369a1;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            white-space: nowrap;
        }
        .highlight {
            background: #fef3c7;
            color: #92400e;
        }
        .section-title {
            font-size: 1rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #22c55e;
        }
        .compact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .deadlines-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            font-size: 0.8rem;
        }
        .deadline {
            background: #fef3c7;
            padding: 8px;
            border-radius: 4px;
            text-align: center;
        }
        .deadline-round {
            font-weight: 600;
            color: #92400e;
        }
        .deadline-date {
            color: #451a03;
            font-size: 0.75rem;
        }
        .companies-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            font-size: 0.8rem;
        }
        .company {
            background: #f8fafc;
            padding: 6px 10px;
            border-radius: 4px;
            text-align: center;
            font-weight: 500;
            color: #475569;
        }
        .alumni-list {
            list-style: none;
            font-size: 0.85rem;
        }
        .alumni-list li {
            padding: 6px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .profile-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            text-align: center;
            font-size: 0.85rem;
            margin-bottom: 15px;
        }
        .profile-stat {
            background: #f8fafc;
            padding: 10px;
            border-radius: 6px;
        }
        .profile-value {
            font-size: 1.1rem;
            font-weight: 700;
            color: #2c3e50;
        }
        .profile-label {
            font-size: 0.75rem;
            color: #666;
            margin-top: 4px;
        }
        .financial-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        .financial-item {
            background: #f8fafc;
            padding: 10px;
            border-radius: 6px;
            text-align: center;
        }
        .financial-value {
            font-size: 1rem;
            font-weight: 700;
            color: #059669;
        }
        .financial-label {
            font-size: 0.75rem;
            color: #666;
            margin-top: 4px;
        }

        /* Responsive Adjustments */
        @media (max-width: 992px) {
            .collapsible-content {
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            }
        }
        @media (max-width: 768px) {
            .top-section {
                grid-template-columns: 1fr;
            }
            .key-metrics {
                grid-template-columns: 1fr;
            }
            .compact-grid {
                grid-template-columns: 1fr;
            }
            .deadlines-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .companies-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .profile-stats {
                grid-template-columns: 1fr;
            }
            .financial-grid {
                grid-template-columns: 1fr;
            }
            .collapsible-content {
                grid-template-columns: 1fr;
            }
        }
        @media (max-width: 480px) {
            .deadlines-grid,
            .companies-grid {
                grid-template-columns: 1fr;
            }
            .btn {
                width: 100%;
            }
        }
      `}</style>

      <div className="dashboard">
        {/* Top Section */}
        <div className="top-section">
          <div className="school-header">
            <h1 className="school-title">{school.name}</h1>
            <div className="school-subtitle">MBA Program</div>
            <div className="location">📍 {school.location}, {school.country}</div>
            <div className="action-buttons">
              <a href="#" className="btn btn-primary">🌐 Visit Website</a>
              <button className="btn btn-secondary">⚖️ Compare</button>
              <button className="btn btn-secondary">⚠️ Report Issue</button>
            </div>
          </div>
          <div className="quick-stats">
            <div className="stats-title">Key Metrics</div>
            <div className="key-metrics">
              <div className="metric">
                <div className="metric-value">{school.qs_mba_rank || 'N/A'}</div>
                <div className="metric-label">QS Rank</div>
              </div>
              <div className="metric">
                <div className="metric-value">{school.class_size || 'N/A'}</div>
                <div className="metric-label">Class Size</div>
              </div>
              <div className="metric">
                <div className="metric-value">{school.mean_gmat || 'N/A'}</div>
                <div className="metric-label">Avg GMAT</div>
              </div>
              <div className="metric">
                <div className="metric-value">{school.women_percentage || 'N/A'}%</div>
                <div className="metric-label">Women</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="middle-section">
          <div className="info-card" onClick={toggleCombinedCard}>
            <div className="card-header">
              <div className="card-title">Program Overview, Tuition & Rankings</div>
              <span className="collapse-icon">{isCollapsed ? '➕' : '➖'}</span>
            </div>
            <div className={`collapsible-content ${isCollapsed ? 'collapsed' : ''}`}>
              {/* Program Details */}
              <div className="combined-card-section">
                <div className="combined-card-subtitle">Program Details</div>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Type</span>
                    <span className="info-value">{school.type || 'Full-time MBA'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Class Size</span>
                    <span className="info-value">{school.class_size || 'N/A'} students</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Avg Work Exp</span>
                    <span className="info-value">{school.avg_work_exp_years || 'N/A'} years</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Women</span>
                    <span className="info-value">{school.women_percentage || 'N/A'}%</span>
                  </div>
                </div>
              </div>

              {/* Tuition & Fees */}
              <div className="combined-card-section">
                <div className="combined-card-subtitle">Tuition & Fees</div>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Total Cost</span>
                    <span className="info-value">{school.total_cost || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Application Fee</span>
                    <span className="info-value">{school.application_fee || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">GMAT Waiver</span>
                    <span className="info-value">{school.gmat_gre_waiver_available ? '✅ Available' : '❌ Not Available'}</span>
                  </div>
                </div>
              </div>

              {/* Rankings & Stats */}
              <div className="combined-card-section">
                <div className="combined-card-subtitle">Rankings & Stats</div>
                <div className="rankings-grid">
                  <div className="ranking-item">
                    <span className="ranking-name">QS MBA Rank</span>
                    <span className="ranking-value">{school.qs_mba_rank || 'N/A'}</span>
                  </div>
                  <div className="ranking-item">
                    <span className="ranking-name">FT Global MBA</span>
                    <span className="ranking-value">{school.ft_global_mba_rank || 'N/A'}</span>
                  </div>
                  <div className="ranking-item">
                    <span className="ranking-name">Bloomberg MBA</span>
                    <span className="ranking-value">{school.bloomberg_mba_rank || 'N/A'}</span>
                  </div>
                  <div className="ranking-item">
                    <span className="ranking-name">Employment 3mo</span>
                    <span className="ranking-value">{school.employment_in_3_months_percent || 'N/A'}%</span>
                  </div>
                  <div className="ranking-item">
                    <span className="ranking-name">Mean GPA</span>
                    <span className="ranking-value">{school.mean_gpa || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="main-content">
          <div className="tabs">
            <div className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => showTab('overview')}>Overview</div>
            <div className={`tab ${activeTab === 'admissions' ? 'active' : ''}`} onClick={() => showTab('admissions')}>Admissions</div>
            <div className={`tab ${activeTab === 'careers' ? 'active' : ''}`} onClick={() => showTab('careers')}>Careers</div>
            <div className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => showTab('profile')}>Class Profile</div>
            <div className={`tab ${activeTab === 'alumni' ? 'active' : ''}`} onClick={() => showTab('alumni')}>Alumni</div>
          </div>
          <div className="tab-content">
            {/* Overview Tab */}
            <div id="overview" className={`tab-pane ${activeTab === 'overview' ? 'active' : ''}`}>
              <div className="description">
                {school.description}
              </div>
              {school.program_tags && school.program_tags.length > 0 && (
                <div className="tags">
                  {school.program_tags.map((tag, index) => (
                    <span key={index} className={`tag ${index === 0 ? 'highlight' : ''}`}>{tag}</span>
                  ))}
                </div>
              )}
              <div className="compact-grid">
                <div>
                  <div className="section-title">Program Features</div>
                  <ul style={{fontSize: '0.85rem', lineHeight: '1.4', marginLeft: '15px'}}>
                    <li>Comprehensive MBA curriculum</li>
                    <li>Global perspective and networking</li>
                    <li>Leadership development</li>
                    <li>Industry connections</li>
                    <li>Career services support</li>
                    <li>Alumni network access</li>
                  </ul>
                </div>
                <div>
                  <div className="section-title">Program Options</div>
                  <div className="financial-grid">
                    <div className="financial-item">
                      <div className="financial-value">Full-time</div>
                      <div className="financial-label">MBA Program</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">{school.class_size || 'N/A'}</div>
                      <div className="financial-label">Class Size</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">{school.women_percentage || 'N/A'}%</div>
                      <div className="financial-label">Women</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">Global</div>
                      <div className="financial-label">Perspective</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admissions Tab */}
            <div id="admissions" className={`tab-pane ${activeTab === 'admissions' ? 'active' : ''}`}>
              <div className="section-title">Application Deadlines</div>
              <div className="deadlines-grid">
                {school.application_deadlines_structured && school.application_deadlines_structured.length > 0 ? (
                  school.application_deadlines_structured.map((deadline, index) => (
                    <div key={index} className="deadline">
                      <div className="deadline-round">{deadline.round}</div>
                      <div className="deadline-date">{deadline.date}</div>
                    </div>
                  ))
                ) : (
                  <div className="deadline">
                    <div className="deadline-round">Check Website</div>
                    <div className="deadline-date">For Deadlines</div>
                  </div>
                )}
              </div>
              <div className="compact-grid" style={{marginTop: '20px'}}>
                <div>
                  <div className="section-title">Academic Requirements</div>
                  <div className="financial-grid">
                    <div className="financial-item">
                      <div className="financial-value">{school.mean_gmat || 'N/A'}</div>
                      <div className="financial-label">Average GMAT</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">{school.mean_gpa || 'N/A'}</div>
                      <div className="financial-label">Mean GPA</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">{school.avg_gre || 'N/A'}</div>
                      <div className="financial-label">Average GRE</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">{school.avg_work_exp_years || 'N/A'} yrs</div>
                      <div className="financial-label">Work Experience</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="section-title">Application Details</div>
                  <div className="financial-grid">
                    <div className="financial-item">
                      <div className="financial-value">{school.application_fee || 'N/A'}</div>
                      <div className="financial-label">Application Fee</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">{school.gmat_gre_waiver_available ? '✅' : '❌'}</div>
                      <div className="financial-label">GMAT/GRE Waiver</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">{school.admissions_rounds || 'N/A'}</div>
                      <div className="financial-label">Admission Rounds</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">{school.class_size || 'N/A'}</div>
                      <div className="financial-label">Class Size</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Careers Tab */}
            <div id="careers" className={`tab-pane ${activeTab === 'careers' ? 'active' : ''}`}>
              <div className="section-title">Employment Statistics</div>
              <div className="financial-grid">
                <div className="financial-item">
                  <div className="financial-value">{school.employment_in_3_months_percent || 'N/A'}%</div>
                  <div className="financial-label">Employment in 3 Months</div>
                </div>
                <div className="financial-item">
                  <div className="financial-value">{school.avg_starting_salary || 'N/A'}</div>
                  <div className="financial-label">Avg Starting Salary</div>
                </div>
                <div className="financial-item">
                  <div className="financial-value">{school.weighted_salary || 'N/A'}</div>
                  <div className="financial-label">Weighted Salary</div>
                </div>
                <div className="financial-item">
                  <div className="financial-value">{school.alumni_network_strength || 'Strong'}</div>
                  <div className="financial-label">Alumni Network</div>
                </div>
              </div>
              <div className="section-title" style={{marginTop: '20px'}}>Top Hiring Companies</div>
              <div className="companies-grid">
                {school.top_hiring_companies_array && school.top_hiring_companies_array.length > 0 ? (
                  school.top_hiring_companies_array.map((company, index) => (
                    <div key={index} className="company">{company}</div>
                  ))
                ) : (
                  <>
                    <div className="company">Major Consulting</div>
                    <div className="company">Investment Banking</div>
                    <div className="company">Technology</div>
                    <div className="company">Fortune 500</div>
                    <div className="company">Startups</div>
                    <div className="company">Private Equity</div>
                  </>
                )}
              </div>
              <div style={{marginTop: '20px'}}>
                <div className="section-title">Career Focus Areas</div>
                <div className="tags">
                  {school.specializations && school.specializations.length > 0 ? (
                    school.specializations.map((spec, index) => (
                      <span key={index} className="tag">{spec}</span>
                    ))
                  ) : (
                    <>
                      <span className="tag">Consulting</span>
                      <span className="tag">Finance</span>
                      <span className="tag">Technology</span>
                      <span className="tag">Marketing</span>
                      <span className="tag">Operations</span>
                      <span className="tag">Strategy</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Class Profile Tab */}
            <div id="profile" className={`tab-pane ${activeTab === 'profile' ? 'active' : ''}`}>
              <div className="section-title">Class Composition</div>
              <div className="profile-stats">
                <div className="profile-stat">
                  <div className="profile-value">N/A</div>
                  <div className="profile-label">International</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-value">{school.women_percentage || 'N/A'}%</div>
                  <div className="profile-label">Women</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-value">N/A</div>
                  <div className="profile-label">Domestic Students of Color</div>
                </div>
              </div>
              <div className="compact-grid">
                <div>
                  <div className="section-title">Academic Profile</div>
                  <div className="financial-grid">
                    <div className="financial-item">
                      <div className="financial-value">{school.mean_gmat || 'N/A'}</div>
                      <div className="financial-label">Average GMAT</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">{school.mean_gpa || 'N/A'}</div>
                      <div className="financial-label">Mean GPA</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">{school.avg_gre || 'N/A'}</div>
                      <div className="financial-label">Average GRE</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">{school.class_size || 'N/A'}</div>
                      <div className="financial-label">Class Size</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="section-title">Experience & Demographics</div>
                  <div className="financial-grid">
                    <div className="financial-item">
                      <div className="financial-value">{school.avg_work_exp_years || 'N/A'} years</div>
                      <div className="financial-label">Avg Work Experience</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">N/A</div>
                      <div className="financial-label">International Students</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">{school.women_percentage || 'N/A'}%</div>
                      <div className="financial-label">Women</div>
                    </div>
                    <div className="financial-item">
                      <div className="financial-value">N/A</div>
                      <div className="financial-label">Students of Color</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alumni Tab */}
            <div id="alumni" className={`tab-pane ${activeTab === 'alumni' ? 'active' : ''}`}>
              <div className="section-title">Notable Alumni</div>
              <ul className="alumni-list">
                {school.notable_alumni_structured && school.notable_alumni_structured.length > 0 ? (
                  school.notable_alumni_structured.map((alumni, index) => (
                    <li key={index}><strong>{alumni.name}</strong> - {alumni.title}</li>
                  ))
                ) : (
                  <>
                    <li><strong>Alumni Name</strong> - Position, Company</li>
                    <li><strong>Alumni Name</strong> - Position, Company</li>
                    <li><strong>Alumni Name</strong> - Position, Company</li>
                    <li><strong>Alumni Name</strong> - Position, Company</li>
                  </>
                )}
              </ul>
              <div style={{marginTop: '20px'}}>
                <div className="section-title">Alumni Network Strength</div>
                <div className="description">
                  {school.alumni_network_strength || 'Strong network with alumni in major corporations, consulting firms, financial services, and technology companies. Active alumni engagement provides excellent mentorship and career opportunities for graduates.'}
                </div>
                <div className="tags">
                  <span className="tag">Corporate Leadership</span>
                  <span className="tag">Consulting</span>
                  <span className="tag">Financial Services</span>
                  <span className="tag">Technology</span>
                  <span className="tag">Entrepreneurship</span>
                  <span className="tag">Global Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
