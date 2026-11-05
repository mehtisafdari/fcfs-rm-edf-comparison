"""Educational comparison of FCFS, Rate Monotonic (RM), and EDF."""
from dataclasses import dataclass
from pathlib import Path
import csv

TASKS = [
    {"name": "T1", "execution": 2, "period": 5},
    {"name": "T2", "execution": 1, "period": 7},
    {"name": "T3", "execution": 2, "period": 10},
]
HORIZON = 20

@dataclass
class Job:
    task: str
    release: int
    execution: int
    period: int
    deadline: int
    remaining: int
    first_start: int | None = None
    completion: int | None = None

def build_jobs():
    jobs = []
    for task in TASKS:
        release = 0
        while release < HORIZON:
            jobs.append(Job(task["name"], release, task["execution"],
                            task["period"], release + task["period"],
                            task["execution"]))
            release += task["period"]
    return jobs

def simulate(policy):
    jobs = build_jobs()
    timeline, preemptions, previous = [], 0, None
    for now in range(HORIZON):
        ready = [j for j in jobs if j.release <= now and j.remaining > 0]
        if policy == "FCFS":
            chosen = previous if previous is not None and previous.remaining > 0 else (
                min(ready, key=lambda j: (j.release, j.task)) if ready else None)
        elif policy == "RM":
            chosen = min(ready, key=lambda j: (j.period, j.release, j.task)) if ready else None
        elif policy == "EDF":
            chosen = min(ready, key=lambda j: (j.deadline, j.release, j.task)) if ready else None
        else:
            raise ValueError("Unknown policy")
        if chosen is None:
            timeline.append((now, "IDLE"))
            previous = None
            continue
        if previous is not None and previous is not chosen and previous.remaining > 0 and policy in ("RM", "EDF"):
            preemptions += 1
        if chosen.first_start is None:
            chosen.first_start = now
        chosen.remaining -= 1
        if chosen.remaining == 0:
            chosen.completion = now + 1
        timeline.append((now, chosen.task))
        previous = chosen

    rows = []
    for j in jobs:
        finish = j.completion
        rows.append({
            "task": j.task, "release": j.release, "deadline": j.deadline,
            "execution": j.execution, "first_start": j.first_start,
            "completion": finish,
            "response_time": j.first_start - j.release if j.first_start is not None else "",
            "turnaround_time": finish - j.release if finish is not None else "",
            "waiting_time": finish - j.release - j.execution if finish is not None else "",
            "deadline_met": finish <= j.deadline if finish is not None else False,
        })
    done = [r for r in rows if r["completion"] != "" and r["completion"] is not None]
    summary = {
        "algorithm": policy, "jobs_released": len(jobs), "jobs_completed": len(done),
        "deadlines_met": sum(bool(r["deadline_met"]) for r in rows),
        "deadlines_missed_or_unfinished": sum(not bool(r["deadline_met"]) for r in rows),
        "average_waiting_time": round(sum(r["waiting_time"] for r in done)/len(done), 2) if done else "",
        "average_response_time": round(sum(r["response_time"] for r in done)/len(done), 2) if done else "",
        "preemptions": preemptions if policy in ("RM", "EDF") else 0,
        "cpu_utilization_percent": round(100 * sum(name != "IDLE" for _, name in timeline)/HORIZON, 2)
    }
    return timeline, rows, summary

def main():
    out = Path(__file__).resolve().parents[1] / "results"
    out.mkdir(exist_ok=True)
    summaries, all_rows = [], []
    for policy in ("FCFS", "RM", "EDF"):
        timeline, rows, summary = simulate(policy)
        summaries.append(summary)
        all_rows.extend({"algorithm": policy, **r} for r in rows)
        with (out / f"{policy.lower()}_jobs.csv").open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows(rows)
        print(f"\\n{policy}: " + " | ".join(f"{t}:{n}" for t, n in timeline))
        print(summary)
    for filename, data in (("comparison_summary.csv", summaries), ("all_job_results.csv", all_rows)):
        with (out / filename).open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(data[0]))
            writer.writeheader()
            writer.writerows(data)

if __name__ == "__main__":
    main()
