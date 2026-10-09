"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { ErrorState, Skeleton } from "../../../components/ui/feedback";
import { ApiRequestError } from "../../auth/services/session-request";
import { useContributorStanding } from "../hooks/use-contributor-standing";
import { loadProfileData, type ContributorProfile, type SkillCatalogItem } from "../services/contributor-api";
import { ContributorProfileForm } from "./contributor-profile-form";
import { CvUploader } from "./cv-uploader";
import { EducationSection } from "./education-section";
import { ExperienceHistory, ExperiencePanel } from "./experience-panel";
import { ReadinessChecklist } from "./readiness-checklist";

/**
 * Trang hồ sơ contributor (design.md 7.2): hạng và thanh kinh nghiệm ở đầu, cột chính là hồ sơ tự khai và học
 * vấn, cột phụ là checklist ứng tuyển, CV và nhật ký XP.
 */
export function ContributorProfileWorkspace() {
  const [data, setData] = useState<{ profile: ContributorProfile; skills: SkillCatalogItem[] } | null>(null);
  const [loadError, setLoadError] = useState<ApiRequestError | null>(null);
  const { state: standing, reload } = useContributorStanding(true);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setData(await loadProfileData());
    } catch (error) {
      setLoadError(error instanceof ApiRequestError ? error : new ApiRequestError("PROFILE_LOAD_FAILED", "Không thể tải hồ sơ của bạn.", 0));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadError) {
    return <ErrorState detail={loadError.message} requestId={loadError.requestId} action={<Button type="button" variant="outline" onClick={() => void load()}>Thử tải lại</Button>} />;
  }
  if (!data) return <ProfileSkeleton />;

  return (
    <div className="stack stack--lg">
      {standing.status === "ready" ? (
        <ExperiencePanel experience={standing.experience} name={data.profile.displayName} />
      ) : standing.status === "error" ? (
        <ErrorState detail={standing.error.message} requestId={standing.error.requestId} action={<Button type="button" variant="outline" onClick={() => void reload()}>Tải lại hạng</Button>} />
      ) : (
        <Skeleton height="16rem" />
      )}

      <div className="profile-grid">
        <div className="stack stack--lg">
          <section className="module-bay module-bay--static" aria-labelledby="profile-basics-title">
            <div className="module-bay__header">
              <span className="module-bay__id">BAY // HỒ SƠ</span>
              <span>TỰ KHAI</span>
            </div>
            <h2 id="profile-basics-title" className="profile-section__title">Thông tin nền tảng</h2>
            <ContributorProfileForm profile={data.profile} skills={data.skills} onSaved={(profile) => setData((current) => current && { ...current, profile })} />
          </section>

          <section className="module-bay module-bay--static" aria-labelledby="profile-education-title">
            <div className="module-bay__header">
              <span className="module-bay__id">BAY // HỌC VẤN</span>
              <span>TÙY CHỌN</span>
            </div>
            <h2 id="profile-education-title" className="profile-section__title">Học vấn</h2>
            <EducationSection />
          </section>
        </div>

        <aside className="stack stack--lg" aria-label="Điều kiện ứng tuyển, CV và kinh nghiệm">
          {standing.status === "ready" ? <ReadinessChecklist readiness={standing.readiness} /> : <Skeleton height="12rem" />}

          <section className="module-bay module-bay--static" id="cv" aria-labelledby="profile-cv-title">
            <div className="module-bay__header">
              <span className="module-bay__id">BAY // CV</span>
              <span>PDF · 2 MB</span>
            </div>
            <h2 id="profile-cv-title" className="profile-section__title">CV ứng tuyển</h2>
            <CvUploader id="profile-cv" />
          </section>

          <section className="module-bay module-bay--static" aria-labelledby="profile-xp-log-title">
            <div className="module-bay__header">
              <span className="module-bay__id">BAY // NHẬT KÝ XP</span>
              <span>{standing.status === "ready" ? `${standing.experience.history.length} DỰ ÁN` : null}</span>
            </div>
            <h2 id="profile-xp-log-title" className="profile-section__title">Dự án đã hoàn thành</h2>
            {standing.status === "ready" ? <ExperienceHistory experience={standing.experience} /> : <Skeleton height="6rem" />}
          </section>
        </aside>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="stack stack--lg" aria-busy="true" aria-label="Đang tải hồ sơ">
      <Skeleton height="16rem" />
      <div className="profile-grid">
        <Skeleton height="24rem" />
        <Skeleton height="16rem" />
      </div>
    </div>
  );
}
