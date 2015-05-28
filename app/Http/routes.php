<?php

use App\Models\Jobsbank\Job;
use App\Models\Jobsbank\JobCategory;
/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

$app->get('/', function() use ($app) {
    return view('home');
});

$app->get('/job_category', function() use ($app) {
	// Cache this query for 10 minutes
	$result = Cache::remember('job_count_by_category', 10, function() 
	{
		$r = DB::table('job_category as jc')
				->select(DB::raw('count(1) as count, jc.category'))
				->join('assoc_job_job_category as ajjc', 'jc.categoryId', '=', 'ajjc.categoryId')
				->join('job as j', 'j.jobId', '=', 'ajjc.jobId')
				->groupBy('jc.categoryId')
				->get();
		return json_encode($r);
	});
    return $result;
});

$app->get('/job_category_by_date', function() use ($app) {
	// Cache this query for 10 minutes
	$result = Cache::remember('job_category_by_date', 1000, function() 
	{
		$categories = JobCategory::all();

		$r = array();

		$all_dates = array();

		foreach ($categories as $category){
			$count_by_date = DB::table('job as j')
				->select(DB::raw('count(1) as count, j.postingDate as date'))
				->join('assoc_job_job_category as ajjc', 'j.jobId', '=', 'ajjc.jobId')
				->join('job_category as jc', 'jc.categoryId', '=', 'ajjc.categoryId')
				->where('jc.categoryId', '=', $category['categoryId'])
				->groupBy('j.postingDate')
				->orderBy('date', 'asc')
				->get();

			$r[$category['category']] = $count_by_date;

			foreach ($count_by_date as $i) {
				if (!in_array($i['date'], $all_dates)){
					array_push($all_dates, $i['date']);
				}
			}
		}

		foreach ($r as $category => $values){
			$marked_dates = [];

			foreach ($all_dates as $date) {
				$marked_dates[$date] = 0;
			}

			foreach ($values as $i) {
				if (in_array($i['date'], $all_dates)) {
					$marked_dates[$i['date']] = 1;
				}
			}

			foreach ($marked_dates as $date => $v) {
				if ($v == 0) {
					array_push($values, [
						'date' => $date,
						'count' => 0
					]);
				}
			}

			usort($values, 'cmp_date'); // Sort dates in ascending order

			$r[$category] = $values;
		}

		return json_encode($r);
	});
    return $result;
});

function cmp_date($a, $b)
{
    return strtotime($a['date']) - strtotime($b['date']);
}