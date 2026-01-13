import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { useAuth } from "../context/AuthContext";
import { GET_JOB } from "../graphql/queries";

function JobDetail() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ fio: '', phone: '', education: '', experience: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const { data, loading, error } = useQuery(GET_JOB, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });

  const job = data?.job;

  // ✅ сохраняем просмотренные вакансии у пользователя
  useEffect(() => {
    if (job && currentUser?.role === "teacher") {
      const viewed = JSON.parse(localStorage.getItem("viewedJobs") || "[]");
      const updated = [...new Set([...viewed, job.id])];
      localStorage.setItem("viewedJobs", JSON.stringify(updated));
    }
  }, [job, currentUser]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const apiBase = (process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:4000/graphql').replace(/\/graphql$/, '');

  const handleSubmitApplication = async (e, jobData) => {
    e.preventDefault();
    if (!jobData) return;

    try {
      const formData = new FormData();
      formData.append('fio', form.fio);
      formData.append('phone', form.phone);
      formData.append('education', form.education);
      formData.append('experience', form.experience);
      formData.append('jobId', jobData.id);
      if (jobData.email) formData.append('toEmail', jobData.email);
      if (jobData.position) formData.append('jobTitle', jobData.position);
      if (jobData.school) formData.append('school', jobData.school);
      if (jobData.region) formData.append('region', jobData.region);
      if (resumeFile) formData.append('resume', resumeFile);

      const res = await fetch(`${apiBase}/api/respond`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Не удалось отправить отклик');
      }

      alert('Ваш отклик отправлен!');
      setIsFormOpen(false);
      setForm({ fio: '', phone: '', education: '', experience: '' });
      setResumeFile(null);
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  if (loading) return (
    <div style={styles.container}>
      <div style={styles.loading}>
        <p style={styles.loadingText}>Загрузка вакансии...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={styles.container}>
      <div style={styles.error}>
        <p style={styles.errorText}>Ошибка загрузки вакансии</p>
        <p style={styles.errorSubtext}>{error.message || error.response?.data?.error || 'Произошла ошибка'}</p>
        <button 
          onClick={() => navigate(-1)} 
          style={styles.backButton}
        >
          ← Назад
        </button>
      </div>
    </div>
  );

  if (!job) return (
    <div style={styles.container}>
      <div style={styles.error}>
        <p style={styles.errorText}>Вакансия не найдена</p>
        <button 
          onClick={() => navigate(-1)} 
          style={styles.backButton}
        >
          ← Назад
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Хлебные крошки */}
      <div style={styles.breadcrumb}>
        <button 
          onClick={() => navigate(-1)} 
          style={styles.backButton}
        >
          ← Назад к вакансиям
        </button>
      </div>

      <div style={{ ...styles.content, ...(isMobile ? styles.contentMobile : {}) }}>
        <div style={{ ...styles.left, ...(isMobile ? styles.leftMobile : {}) }}>
          {/* Заголовок */}
          <div style={styles.header}>
            <h1 style={styles.title}>{job.position}</h1>
            <div style={styles.meta}>
              <span style={styles.school}>{job.school}</span>
              <span style={styles.region}>{job.region}</span>
            </div>
          </div>

          {/* Основная информация */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Основная информация</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Часы работы:</span>
                <span style={styles.infoValue}>{job.hours || "Не указано"}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Зарплата:</span>
                <span style={styles.infoValue}>{job.salary || "Не указана"}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Жильё:</span>
                <span style={styles.infoValue}>{job.housing || "Не предоставляется"}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Льготы:</span>
                <span style={styles.infoValue}>{job.benefits || "Не указаны"}</span>
              </div>
            </div>
          </div>

          {/* Обязанности */}
          {job.duties && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Обязанности</h2>
              <p style={styles.duties}>{job.duties}</p>
            </div>
          )}

          {/* Меры поддержки */}
          {job.support && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Меры поддержки</h2>
              <p style={styles.support}>{job.support}</p>
            </div>
          )}
        </div>

        <div style={{ ...styles.right, ...(isMobile ? styles.rightMobile : {}) }}>
          {/* Боковая панель с контактами */}
          <div style={styles.sidebar}>
            <div style={styles.contactCard}>
              <h3 style={styles.contactTitle}>Контактная информация</h3>
              
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Школа:</span>
                <span style={styles.contactValue}>{job.school}</span>
              </div>

              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Район:</span>
                <span style={styles.contactValue}>{job.region}</span>
              </div>

              {job.contacts && (
                <div style={styles.contactItem}>
                  <span style={styles.contactLabel}>Контакты:</span>
                  <span style={styles.contactValue}>{job.contacts}</span>
                </div>
              )}

              {job.email && (
                <div style={styles.contactItem}>
                  <span style={styles.contactLabel}>Email:</span>
                  <span style={styles.contactValue}>
                    <a href={`mailto:${job.email}`} style={styles.emailLink}>
                      {job.email}
                    </a>
                  </span>
                </div>
              )}

              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Дата открытия:</span>
                <span style={styles.contactValue}>
                  {job.openDate
                    ? (() => {
                        try {
                          const date = typeof job.openDate === 'string' 
                            ? new Date(job.openDate) 
                            : new Date(Number(job.openDate));
                          return date.toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          });
                        } catch (e) {
                          return "Не указана";
                        }
                      })()
                    : "Не указана"}
                </span>
              </div>

              {job.studentEmployment && (
                <div style={styles.studentBadge}>
                  ✅ Готовы взять студента старшего курса
                </div>
              )}

              <button style={styles.applyButton} onClick={() => setIsFormOpen(true)}>
                Откликнуться на вакансию
              </button>

              {currentUser?.role === "teacher" && (
                <div style={styles.saveInfo}>
                  📌 Вакансия сохранена в истории просмотров
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Application Form */}
      {isFormOpen && (
        <div style={styles.modalBackdrop} onClick={() => setIsFormOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Отправить отклик</h2>
            <form onSubmit={(e) => handleSubmitApplication(e, job)}>
              <div style={styles.formRow}>
                <label style={styles.label}>ФИО</label>
                <input
                  style={styles.input}
                  value={form.fio}
                  onChange={(e) => setForm({ ...form, fio: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Телефон</label>
                <input
                  style={styles.input}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+7 (XXX) XXX-XX-XX"
                  required
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Образование</label>
                <textarea
                  style={styles.textarea}
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Опыт работы</label>
                <textarea
                  style={styles.textarea}
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Резюме (PDF, DOC, DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'flex-end' }}>
                <button type="button" style={styles.backButton} onClick={() => setIsFormOpen(false)}>
                  Отмена
                </button>
                <button type="submit" style={styles.applyButton}>
                  Отправить отклик
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Raleway, sans-serif'
  },
  breadcrumb: {
    marginBottom: 30
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#2637A1',
    fontSize: 16,
    fontFamily: 'Raleway, sans-serif',
    cursor: 'pointer',
    padding: '10px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'color 0.3s ease'
  },
  content: {
    display: 'flex',
    gap: 30,
    alignItems: 'flex-start'
  },
  contentMobile: {
    flexDirection: 'column'
  },
  left: {
    flex: 2,
    background: '#FAFAFF',
    padding: 40,
    borderRadius: 20,
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
  },
  leftMobile: {
    padding: 20
  },
  right: {
    flex: 1,
    minWidth: 300
  },
  rightMobile: {
    width: '100%',
    minWidth: 'auto'
  },
  header: {
    marginBottom: 40,
    borderBottom: '2px solid #E8F6FF',
    paddingBottom: 30
  },
  title: {
    fontSize: 42,
    color: '#313137',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    margin: '0 0 15px 0',
    lineHeight: 1.2
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  school: {
    fontSize: 20,
    color: '#25258E',
    fontWeight: 500
  },
  region: {
    fontSize: 16,
    color: '#666',
    fontWeight: 400
  },
  section: {
    marginBottom: 40
  },
  sectionTitle: {
    fontSize: 24,
    color: '#313137',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    margin: '0 0 20px 0',
    paddingBottom: 10,
    borderBottom: '1px solid #E8F6FF'
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  infoLabel: {
    color: '#666',
    fontSize: 16,
    fontWeight: 500
  },
  infoValue: {
    color: '#313137',
    fontSize: 16,
    fontWeight: 400,
    textAlign: 'right'
  },
  duties: {
    fontSize: 16,
    color: '#313137',
    lineHeight: 1.6,
    margin: 0
  },
  support: {
    fontSize: 16,
    color: '#313137',
    lineHeight: 1.6,
    margin: 0
  },
  sidebar: {
    position: 'sticky',
    top: 20
  },
  contactCard: {
    background: '#FAFAFF',
    padding: 30,
    borderRadius: 20,
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
    border: '1px solid #E8F6FF'
  },
  contactTitle: {
    fontSize: 20,
    color: '#313137',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    margin: '0 0 25px 0',
    textAlign: 'center'
  },
  contactItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: '1px solid #E8F6FF'
  },
  contactLabel: {
    display: 'block',
    color: '#666',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 5
  },
  contactValue: {
    display: 'block',
    color: '#313137',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.4
  },
  emailLink: {
    color: '#2637A1',
    textDecoration: 'none',
    transition: 'color 0.3s ease'
  },
  studentBadge: {
    background: '#E8F6FF',
    color: '#00516F',
    padding: '12px 16px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'center',
    margin: '20px 0',
    border: '1px solid #b8e2f7'
  },
  applyButton: {
    width: '100%',
    padding: '16px 20px',
    backgroundColor: '#2637A1',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: 10
  },
  saveInfo: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 15,
    fontStyle: 'italic'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh'
  },
  loadingText: {
    fontSize: 20,
    color: '#313137',
    fontFamily: 'Raleway, sans-serif'
  },
  error: {
    textAlign: 'center',
    padding: 40,
    background: '#FAFAFF',
    borderRadius: 20,
    marginTop: 40
  },
  errorText: {
    fontSize: 24,
    color: '#ff4444',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: 500,
    marginBottom: 10
  },
  errorSubtext: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Raleway, sans-serif',
    marginBottom: 20
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },
  modal: {
    background: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 520,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  formRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12
  },
  label: {
    fontSize: 14,
    color: '#313137',
    fontWeight: 500
  },
  input: {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14
  },
  textarea: {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    minHeight: 80,
    resize: 'vertical'
  }
};

export default JobDetail;