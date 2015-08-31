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
$app->group(['prefix' => 'fyp'], function ($app) {
	$app->get('/', function() use ($app) {
	    return view('home');
	});

	$app->get('job_category', function() use ($app) {
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

	$app->get('job_level_by_date', function() use ($app) {
		// Cache this query for 10 minutes
		$result = Cache::remember('job_level_by_date', 1000, function() 
		{
			$r = get_by_date([
				'table' => 'job_level',
				'table_primary' => 'jobLevelId',
				'table_field' => 'description',
				'assoc' => 'assoc_job_job_level',
				'assoc_table_primary' => 'jobLevelId'
			]);

			return json_encode($r);
		});
	    return $result;
	});

	$app->get('location_by_date', function() use ($app) {
		// Cache this query for 10 minutes
		$result = Cache::remember('location_by_date', 1000, function() 
		{
			$r = get_by_date([
				'table' => 'location',
				'table_primary' => 'locationId',
				'table_field' => 'description',
				'assoc' => 'assoc_job_location',
				'assoc_table_primary' => 'locationId'
			]);

			return json_encode($r);
		});
	    return $result;
	});

	$app->get('emp_type_by_date', function() use ($app) {
		// Cache this query for 10 minutes
		$result = Cache::remember('emp_type_by_date', 1000, function() 
		{
			$r = get_by_date([
				'table' => 'employment_type',
				'table_primary' => 'empId',
				'table_field' => 'type',
				'assoc' => 'assoc_job_employment_type',
				'assoc_table_primary' => 'empId'
			]);

			return json_encode($r);
		});
	    return $result;
	});

	$app->get('job_category_by_date', function() use ($app) {
		// Cache this query for 10 minutes
		$result = Cache::remember('job_category_by_date', 1000, function() 
		{
			$r = get_by_date([
				'table' => 'job_category',
				'table_primary' => 'categoryId',
				'table_field' => 'category',
				'assoc' => 'assoc_job_job_category',
				'assoc_table_primary' => 'categoryId'
			]);

			return json_encode($r);
		});
	    return $result;
	});

	$app->get('industry_by_date', function() use ($app) {
		// Cache this query for 10 minutes
		$result = Cache::remember('industry_by_date', 1000, function() 
		{
			
			$r = get_by_date([
				'table' => 'industry',
				'table_primary' => 'industryId',
				'table_field' => 'description',
				'assoc' => 'assoc_job_industry',
				'assoc_table_primary' => 'industryId'
			]);

			return json_encode($r);
		});
	    return $result;
	});

	function cmp_date($a, $b)
	{
	    return strtotime($a->date) - strtotime($b->date);
	}

	function get_by_date($info)
	{
		$table = $info['table'];
		$table_primary = $info['table_primary'];
		$table_field = $info['table_field'];
		$assoc = $info['assoc'];
		$assoc_table_primary = $info['assoc_table_primary'];

		$major_type = DB::table($table)->get();

		$r = array();

		$all_dates = array();

		foreach ($major_type as $i){
			$count_by_date = DB::table('job as j')
				->select(DB::raw('count(1) as count, j.postingDate as date'))
				->join("$assoc as a", 'j.jobId', '=', 'a.jobId')
				->join("$table as i", "i.$table_primary", '=', "a.$assoc_table_primary")
				->where("i.$table_primary", '=', $i->{$table_primary})
				->groupBy('j.postingDate')
				->orderBy('date', 'asc')
				->get();

			$r[$i->{$table_field}] = $count_by_date;

			foreach ($count_by_date as $i) {
				if (!in_array($i->date, $all_dates)){
					array_push($all_dates, $i->date);
				}
			}
		}

		foreach ($r as $category => $values){
			$marked_dates = [];

			foreach ($all_dates as $date) {
				$marked_dates[$date] = 0;
			}

			foreach ($values as $i) {
				if (in_array($i->date, $all_dates)) {
					$marked_dates[$i->date] = 1;
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

		return $r;
	}
});