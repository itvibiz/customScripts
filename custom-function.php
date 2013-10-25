<?php

/**
 * @Return categories 
 */
function get_categories_posted(){
    $categories = array_map(function($n){
        return get_category($n);
    },$_POST['post_category']);
    return array_slice($categories,1);
}

/**
 * @Return Array
 * list of database name
 */
function partnerDB(){
    return [
        'db_garudaberjangka',
        't30589_mandiri',
        'db_fsfutures',
    ];
}

/**
 * @Return connection
 */
function cn(){
    $c = mysql_connect('10.10.2.21','root','vibiz123') or die(mysql_error());
    return $c;
}

/**
 * insert white labeling
 */
function d_insert($post_id){
    $wllists = partnerDB();
    $image = wp_get_attachment_image_src( get_post_thumbnail_id( $post_id ), 'single-post-thumbnail' );
    
    $categories = get_categories_posted();
    $content = strip_tags($_POST['content']);
    
    foreach ($wllists as $wllist){
        mysql_select_db($wllist, cn());
        $r = mysql_query('show tables from '.$wllist.'');

        while($tables = mysql_fetch_array($r)){
            foreach ($categories as $category){
		$category->slug = $category->slug == "recommendation" ? "forex_recommendation" : $category->slug;

                if($tables[0] === str_replace("-", "_", $category->slug)){
                    if($wllist==='t30589_mandiri'){
                        mandiri($tables[0], $content);
                    }else{
                        generalWL($tables[0], $content, $image[0]);
                    }
                }
            }
        }   
    }
}

function d_insert_scheduled($post_id){
    $wllists = partnerDB();
    
    mysql_select_db('db_vibiznews', mysql_connect('localhost','root','root', true));
    
    $postQuery = 'SELECT post.id AS id, 
                        post.post_date AS tanggal, 
                        post.post_title AS judul, 
                        post.post_content AS isi
                 FROM wp_posts post
                 JOIN wp_term_relationships rel ON post.id = rel.object_id
                 JOIN wp_term_taxonomy tax ON rel.term_taxonomy_id = tax.term_taxonomy_id
                 JOIN wp_terms term ON tax.term_id = term.term_id
                 WHERE tax.taxonomy = "category" AND post.id = "'.$post_id.'"';
    $postQueryResult = mysql_query($postQuery);
    
    $post = array();
        

    while($result = mysql_fetch_array($postQueryResult)){
        $post = array(
            'id' => $result[0],
            'tanggal' => $result[1],
            'judul' => $result[2],
            'isi' => strip_tags($result[3])
        );
        
    }
        
    $postImage = wp_get_attachment_image_src(get_the_post_thumbnail($post_id, 'large'));
    
    $categoriesQuery = 'SELECT term.slug
                        FROM wp_posts post
                        JOIN wp_term_relationships rel ON post.id = rel.object_id
                        JOIN wp_term_taxonomy tax ON rel.term_taxonomy_id = tax.term_taxonomy_id
                        JOIN wp_terms term ON tax.term_id = term.term_id
                        WHERE tax.taxonomy = "category" AND post.id = "'.$post_id.'"';
    $categoriesQueryResult = mysql_query($categoriesQuery);
    
    while($category = mysql_fetch_array($categoriesQueryResult)){
        $category = $category[0] == "recommendation" ? "forex_recommendation" : $category[0];

        foreach ($wllists as $wllist){
            mysql_select_db($wllist, cn());
            
            $r = mysql_query('SHOW tables FROM '.$wllist.'', cn());

            while($tables = mysql_fetch_array($r)){
                
                if($tables[0] === str_replace("-", "_", $category)){
                    if($wllist==='t30589_mandiri'){
                        $insertQuery = 'INSERT INTO '.$tables[0].'
                                        (tanggal, judul, description, isi, symbol) 
                                        VALUES("'.$post['tanggal'].'",
                                               "'.$post['judul'].'",
                                               "",
                                               "'.$post['isi'].'",
                                               "")';
                        
                        mysql_select_db($wllist, cn());
                        mysql_query($insertQuery, cn());
                    }else{
                        $insertQuery = 'INSERT INTO '.$tables[0].'
                                        (tanggal, judul, description, isi, image, attachment) 
                                        VALUES("'.$post['tanggal'].'",
                                               "'.$post['judul'].'",
                                               "",
                                               "'.$post['isi'].'",
                                               "'.$postImage.'",
                                               "")';
                        
                        mysql_select_db($wllist, cn());
                        mysql_query($insertQuery, cn());
                    }
                }
            }
        }
    }
}

function mandiri($table, $content){
    return mysql_query('INSERT INTO `'.$table.'`(tanggal, judul, description, isi, symbol) VALUES (now(), "'.$_POST['post_title'].'", "","'.$content.'", "")');
}

function generalWL($table, $content, $image){
    return mysql_query('INSERT INTO `'.$table.'`(tanggal, judul, description, isi, image, attachment) VALUES (now(), "'.$_POST['post_title'].'", "","'.$content.'", "'.$image.'", "")');
}