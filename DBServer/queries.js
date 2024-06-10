module.exports = {
  newCasesPerMonth: `select ap.city, f.cases_year, f.cases_month, f.total_time
                      from (select p.city, p.case_id
                            from central.mh_project p
                            where p.city = %s) ap,
                           (select t.cases_year, t.cases_month, t.hospital
                            from (select * from central.cases_more_15 dm15 where dm15.cases_year = %s) t
                            group by(t.cases_year, t.cases_month, t.hospital)) f
                      where ap.hospital_code = f.hospital`,
  workReasons: `select final.city, final.event_type, count(*) as effect
                        from (select t2.city, t2.cases_year, t2.cases_month, t1.event_type
                              from (select t.event_year, t.event_month, t.event_type
                                    from (select * from central.workevent w where w.event_year = %s) t
                                    group by(t.event_year, t.event_month, t.event_type)) t1,
                                    (select ap.city, f.cases_year, f.cases_month, f.total_time
                                    from (select p.city, p.hospital_code
                                          from central.hospital_project p
                                          where p.city = %s) ap,
                                          (select t.cases_year, t.cases_month, t.hospital, sum(t.work_del) as total_time
                                          from (select *
                                                from central.cases_more_15 dm15
                                                where dm15.cases_year = %s) t
                                          group by(t.cases_year, t.cases_month, t.hospital)) f
                                    where ap.hospital_code = f.hospital) t2
                              where t1.event_year = t2.cases_year
                              and t1.event_month = t2.cases_month) final
                        group by (final.city, final.event_type)`,
  mostCasesPerYear: `select *
                        from (select prevalenceType, cases_month, sum(prevalenceType_cases) total_cases
                              from central.cases_more_15
                              where cases_year = %s
                              and prevalenceType in (select prevalenceType
                              from (select prevalenceType
                                    , sum (prevalenceType_cases) as total_cases
                              from central.cases_more_15 dm15
                              where dm15.cases_year = %s
                              group by dm15.prevalenceType
                              order by total_cases desc fetch first 1 rows only))
                              group by cases_month, prevalenceType
                              order by cases_month + 0)
                              natural join central.prevalenceType`,
  CaseTypeCompareByYear: `select *
                              from ((select sum(covid_cases)      as covid_cases,
                                          sum(total_prevalence_cases) as total_prevalence_cases,
                                          sum(work_cases)         as work_cases,
                                          sum(fam_cases)           as fam_cases,
                                          sum(city_cases)       as city_cases, %s as year
                                    from
                                    central.cases_more_15
                                    where cases_year= %s and cases_month = %s)
                                    union
                                    select sum(covid_cases)      as covid_cases,
                                          sum(total_prevalence_cases) as total_prevalence_cases,
                                          sum(work_cases)         as work_cases,
                                          sum(fam_cases)           as fam_cases,
                                          sum(city_cases)       as city_cases, %s as year
                                    from
                                    central.cases_more_15
                                    where cases_year= %s and cases_month = %s)
                              order by year asc`,
  familyCases: `select ap.hospital_name, final.total_no_of_cases
                        from central.hospital_project ap,
                              (select f1.cases_year,
                                    f1.cases_month,
                                    f1.hospital,
                                    f1.no_of_cases + f2.no_of_cases as total_no_of_cases
                              from (select t.cases_year, t.cases_month, t.hospital, count(t.family_cases) as no_of_cases
                                    from (select *
                                          from central.cases_more_15 d15
                                          where d15.cases_year = %s
                                          and d15.cases_month = %s
                                          and d15.family_cases
                                                > 0) t
                                    group by (t.cases_year, t.cases_month, t.hospital)) f1,

                                    (select t1.cases_year, t1.cases_month, t1.hospital, count(t1.family_ct) as no_of_casess
                                    from (select *
                                          from central.cases_less_15 l15
                                          where l15.cases_year = %s
                                          and l15.cases_month = %s
                                          and l15.family_ct
                                                > 0) t1
                                    group by (t1.cases_year, t1.cases_month, t1.hospital)) f2

                              where f1.cases_year = f2.cases_year
                              and f1.cases_month = f2.cases_month
                              and f1.hospital = f2.hospital) final
                        where ap.hospital_code = final.hospital
                        order by final.total_no_of_cases desc fetch first 5 rows only`,
};
