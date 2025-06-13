import React from "react";
import { Link } from "react-router-dom";
import "./GymDashboard.css"; // Import your CSS file for styling
import { useLanguage } from "../../context/LanguageContext"; // Import the language context

const GymDashboard: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div>
      <h1>{t("gymDashboard.title")}</h1>
      <div>
        <h2>{t("gymDashboard.categories")}</h2>
        <ul>
          <li>
            <Link to="/gym/edit-profile">{t("gymDashboard.editProfile")}</Link>
          </li>
          <li>
            <Link to="/gym/pending-combats">
              {t("gymDashboard.pendingCombats")}
            </Link>
          </li>
          <li>
            <Link to="/gym/calendar">{t("gymDashboard.combatCalendar")}</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GymDashboard;
