import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler

class ProjectHealthAnalyzer:
    def analyze(self, df):
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        daily_commits = df.groupby(df['date'].dt.date).size()
        consistency = 1.0 / (1.0 + daily_commits.std()) if len(daily_commits) > 1 else 1.0
        
        if len(daily_commits) > 1:
            x = np.arange(len(daily_commits)).reshape(-1, 1)
            y = daily_commits.values.reshape(-1, 1)
            slope = np.polyfit(x.flatten(), y.flatten(), 1)[0]
            trend = "Increasing" if slope > 0.1 else "Decreasing" if slope < -0.1 else "Stable"
        else:
            trend = "Stable"

        score = 50 + (consistency * 20) + (min(len(df) / 100, 1) * 30)
        
        return {
            "health_score": round(score, 1),
            "consistency": round(consistency, 2),
            "trend": trend,
            "total_commits": len(df),
            "active_days": len(daily_commits)
        }

class CompletionEstimator:
    def predict(self, df, total_scope=None, target_date=None):
        df['date'] = pd.to_datetime(df['date'])
        daily_commits = df.groupby(df['date'].dt.date).size()
        
        if len(daily_commits) < 2:
            return {"status": "Insufficient data"}

        avg_velocity = daily_commits.mean()
        current_commits = len(df)
        
        if target_date:
            target_datetime = datetime.strptime(target_date, "%Y-%m-%d")
            days_until_target = (target_datetime - datetime.now()).days
            
            if days_until_target <= 0:
                return {
                    "status": "Target date has passed or is today",
                    "avg_daily_commits": round(avg_velocity, 1),
                    "days_remaining": 0
                }
            
            estimated_total_scope = current_commits * 2
            remaining_commits = max(0, estimated_total_scope - current_commits)
            velocity_needed = remaining_commits / days_until_target if days_until_target > 0 else 999
            
            will_complete_on_time = avg_velocity >= velocity_needed
            
            return {
                "avg_daily_commits": round(avg_velocity, 1),
                "estimated_completion": target_date,
                "days_remaining": days_until_target,
                "velocity_needed": round(velocity_needed, 1),
                "projected_scope": estimated_total_scope,
                "on_track": will_complete_on_time
            }
        
        target = total_scope if total_scope else current_commits * 2
        
        remaining = max(0, target - current_commits)
        days_needed = remaining / avg_velocity if avg_velocity > 0 else 999
        
        estimated_date = datetime.now() + timedelta(days=days_needed)
        
        return {
            "avg_daily_commits": round(avg_velocity, 1),
            "estimated_completion": estimated_date.strftime("%Y-%m-%d"),
            "days_remaining": round(days_needed, 0),
            "target_commits": target
        }

class TeamAnalyzer:
    def analyze(self, df):
        report = []
        
        for author, group in df.groupby('author'):
            commit_count = len(group)
            lines_added = group['additions'].sum()
            lines_deleted = group['deletions'].sum()
            
            avg_msg_len = group['message'].str.len().mean()
            
            churn_ratio = lines_deleted / (lines_added + 1)
            
            import math
            raw_score = (commit_count * 2) + (math.log(lines_added + 1) * 5) + (min(avg_msg_len, 50) * 0.5)
            impact_score = min(100, raw_score)
            
            recent_msgs = " ".join(group.tail(5)['message'].tolist()).lower()
            focus_area = "Feature Work"
            if "fix" in recent_msgs or "bug" in recent_msgs:
                focus_area = "Bug Fixing"
            elif "refactor" in recent_msgs or "clean" in recent_msgs:
                focus_area = "Refactoring"
            elif "merge" in recent_msgs:
                focus_area = "Integration"

            feedback = []
            
            avg_lines = (lines_added + lines_deleted) / commit_count if commit_count > 0 else 0
            if avg_lines > 500:
                feedback.append("Large commits detected (> 500 lines). Recommend splitting.")
            elif avg_lines < 10:
                feedback.append("Commits are atomic and well-sized.")
                
            if avg_msg_len < 20:
                feedback.append("Commit messages are short. Add more context.")
            
            risk_score = 0
            
            risk_score += min(churn_ratio * 100, 100) * 0.4
            
            size_risk = min(max(avg_lines - 100, 0) / 200, 1) * 30
            risk_score += size_risk
            
            doc_risk = (1 - min(avg_msg_len / 20, 1)) * 30
            risk_score += doc_risk
            
            risk_level = "Low"
            if risk_score > 60:
                risk_level = "High"
            elif risk_score > 30:
                risk_level = "Medium"

            if risk_level == "High":
                feedback.append("High Risk detected! Focus on smaller commits and better docs.")
            
            report.append({
                "author": author,
                "commits": int(commit_count),
                "lines_added": int(lines_added),
                "impact_score": round(impact_score, 1),
                "focus_area": focus_area,
                "risk_score": round(risk_score, 1),
                "risk_level": risk_level,
                "feedback": feedback
            })
            
        return sorted(report, key=lambda x: x['impact_score'], reverse=True)
