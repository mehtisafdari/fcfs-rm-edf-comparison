# مقایسه الگوریتم‌های FCFS، RM و EDF
**Comparative Analysis of FCFS vs. RM and EDF**

این پروژه سه روش زمان‌بندی را با workload و بازه شبیه‌سازی یکسان مقایسه می‌کند.

- **FCFS:** اولین job واردشده زودتر اجرا می‌شود؛ در این پروژه غیرقابل‌قبضه (Non-preemptive) است.
- **RM (Rate Monotonic):** وظیفه با دوره کوتاه‌تر اولویت ثابت بالاتری دارد؛ در این پروژه Preemptive است.
- **EDF (Earliest Deadline First):** job با deadline مطلق نزدیک‌تر اولویت بالاتری دارد؛ در این پروژه Preemptive است.

## ساختار
- `src/scheduler.py`: شبیه‌ساز سه الگوریتم
- `results/`: خروجی‌های CSV و نتیجه اجرای نمونه
- `docs/report.md`: گزارش تمرین
- `docs/gantt_comparison.png`: نمودار گانت نمونه
- `requirements.txt`: وابستگی‌ها

## اجرا
به Python 3.10 یا جدیدتر نیاز است. در پوشه اصلی اجرا کنید:
```bash
python src/scheduler.py
```
نتایج در پوشه `results` ذخیره می‌شوند.

## سناریوی یکسان آزمایش
| وظیفه | زمان اجرا C | دوره T | deadline نسبی D |
|---|---:|---:|---:|
| T1 | 2 | 5 | 5 |
| T2 | 1 | 7 | 7 |
| T3 | 2 | 10 | 10 |

زمان ورود اولیه همه وظایف صفر و مدت شبیه‌سازی 20 واحد زمانی است. هر job در هر دوره آزاد می‌شود و deadline آن برابر release time به‌علاوه period است.

## معیارها
تعداد jobهای تکمیل‌شده، deadlineهای رعایت‌شده/ناتمام، میانگین زمان انتظار، میانگین زمان پاسخ، تعداد preemption و درصد استفاده از CPU.

## محدودیت‌ها و نکته علمی
FCFS الگوریتم عمومی صف‌بندی است و برای انتخاب job به deadline یا period توجه نمی‌کند؛ RM و EDF برای زمان‌بندی بلادرنگ وظایف دوره‌ای استفاده می‌شوند. این پروژه یک آزمایش آموزشی است، نه اثبات برتری همیشگی یک الگوریتم. مدل تک‌پردازنده‌ای و گسسته است و هزینه تعویض متن (context-switch overhead) را در نظر نمی‌گیرد. jobهای ناتمام در پایان بازه، deadline رعایت‌نشده محسوب می‌شوند.

## English summary
This educational project compares non-preemptive FCFS with preemptive RM and EDF on the same periodic task set. It reports completion, deadline success, waiting time, response time, preemptions, and CPU utilization.
