<?php

include 'config.php';

/* Query */
$query = 'select * from employees';
$result = mysqli_query($con, $query);

$html = '';
while( $row=mysqli_fetch_array($result) ){
  $emp_name = $row['emp_name'];
  $email = $row['email'];
  $salary = $row['salary'];
  $city = $row['city'];

  $html .='<tr>';
  $html .='<td>'.$emp_name.'</td>';
  $html .='<td>'.$email.'</td>';
  $html .='<td>'.$salary.'</td>';
  $html .='<td>'.$city.'</td>';
  $html .='</tr>';
}

echo $html;
